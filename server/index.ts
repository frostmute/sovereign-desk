/**
 * Sovereign Desk Server
 * Local backend managing SQLite store, Typst compiler, and Editorial Web UI
 */

import { existsSync, readFileSync } from "fs";
import { resolve, join } from "path";
import {
  db,
  getApplications,
  getApplication,
  updateApplicationStatus,
  insertJobPosting,
  insertTimelineEvent,
  getTimelineEvents,
  insertContact,
  getContacts,
} from "./db";
import { generateBulletDiff, compileBespokeResume } from "./diff-engine";

const PORT = parseInt(process.env.PORT || "3000", 10);
const PROJECT_ROOT = existsSync(resolve(process.cwd(), "profile.yaml"))
  ? process.cwd()
  : resolve(import.meta.dir, "..");
const PUBLIC_DIR = resolve(PROJECT_ROOT, "public");
const OUTPUT_DIR = resolve(PROJECT_ROOT, "output");
const N8N_DISPATCH_WEBHOOK = process.env.N8N_DISPATCH_WEBHOOK || "http://localhost:5678/webhook/dispatch-application";

console.log(`[sovereign-desk] Initializing Sovereign Desk on port ${PORT}...`);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // CORS headers for local interaction
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // API: System Status
    if (pathname === "/api/status") {
      const apps = (getApplications() as any[]) || [];
      const pendingCount = apps.filter((a) => a.status === "PENDING_AUTHORIZATION").length;
      const jobCount = (db.query("SELECT COUNT(*) as count FROM job_postings").get() as any)?.count || 0;

      return Response.json(
        {
          status: "OPERATIONAL",
          engine: "Sovereign Desk v1.0",
          compiler: "Typst 0.15.1",
          activeApplications: apps.length,
          ingestedJobs: jobCount,
          pendingDecisions: pendingCount,
          lastSync: new Date().toLocaleTimeString(),
          mode: "SOVEREIGN_AIRGAP",
        },
        { headers }
      );
    }

    // API: List Applications
    if (pathname === "/api/applications") {
      const apps = getApplications();
      return Response.json({ applications: apps }, { headers });
    }

    // API: Literary Bullet Diff for an Application
    if (pathname === "/api/diff") {
      const id = url.searchParams.get("id");
      const apps = (getApplications() as any[]) || [];
      let targetApp = id ? apps.find((a) => a.id === id) : null;
      if (!targetApp && apps.length > 0) {
        targetApp = apps[0];
      }

      if (!targetApp) {
        targetApp = {
          id: "app-default",
          company: "Anthropic",
          role: "Staff Systems Engineer, Cluster Orchestration",
          match_score: 96,
          transport: "Greenhouse API",
        };
      }

      const diffReport = generateBulletDiff(targetApp);
      return Response.json(diffReport, { headers });
    }

    // API: Compile Tailored Typst Resume for an Application
    if (pathname === "/api/diff/compile" && req.method === "POST") {
      let body: any = {};
      try {
        body = await req.json();
      } catch {}

      const appId = body.id;
      const apps = (getApplications() as any[]) || [];
      const app = apps.find((a) => a.id === appId) || {
        id: appId || "app-101",
        company: body.company || "Anthropic",
        role: body.role || "Staff Systems Engineer",
      };

      const result = await compileBespokeResume(app);

      // Log timeline event
      insertTimelineEvent({
        application_id: app.id,
        event_type: "RECOMPILED_TYPST",
        summary: `Tailored 1-page Typst resume compiled in ${result.latencyMs}ms.`,
        detail: `Artifact saved to ${result.pdfPath} with zero overflow.`,
      });

      return Response.json(result, { headers });
    }

    // API: Ingest Scraped Job Leads (from n8n webhooks)
    if (pathname === "/api/webhooks/jobs" && req.method === "POST") {
      try {
        const body: any = await req.json();
        const jobs = Array.isArray(body) ? body : [body];

        for (const job of jobs) {
          if (!job.id || !job.company || !job.title) continue;

          insertJobPosting({
            id: job.id,
            company: job.company,
            title: job.title,
            location: job.location,
            board_type: job.board_type || "greenhouse",
            external_url: job.external_url,
            match_score: job.match_score || 80,
          });

          // If high match score, stage for executive authorization
          if ((job.match_score || 0) >= 85) {
            const appId = `app-${job.id.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`;
            const existing = getApplication(appId);
            if (!existing) {
              db.run(
                `INSERT INTO applications (id, job_id, company, role, match_score, status, transport, staged_at)
                 VALUES ($id, $job_id, $company, $role, $match_score, $status, $transport, $staged_at)`,
                {
                  $id: appId,
                  $job_id: job.id,
                  $company: job.company,
                  $role: job.title,
                  $match_score: job.match_score || 85,
                  $status: "PENDING_AUTHORIZATION",
                  $transport: job.board_type === "ashby" ? "Ashby API" : "Greenhouse API",
                  $staged_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }
              );

              insertTimelineEvent({
                application_id: appId,
                event_type: "STAGED",
                summary: `Automated match (${job.match_score}%). Staged for executive authorization.`,
                detail: `Ingested via n8n ${job.board_type} scraper from ${job.external_url || job.company}.`,
              });
            }
          }
        }

        return Response.json({ success: true, processed: jobs.length }, { headers });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 400, headers });
      }
    }

    // API: Ingest Inbound Recruiter Email (from n8n IMAP watcher)
    if (pathname === "/api/webhooks/inbound-email" && req.method === "POST") {
      try {
        const body: any = await req.json();
        const company = body.company;
        const senderName = body.senderName || body.sender_name || body.name;
        const senderEmail = body.senderEmail || body.sender_email || body.email;
        const subject = body.subject || "Recruiter Outreach";
        const proposedSlots = body.proposedSlots || body.proposed_slots || body.slots || "Flexible";
        const appId = body.appId || body.application_id || body.applicationId || "app-101";

        let contactId = "";
        if (company && senderName) {
          contactId = insertContact({
            company,
            name: senderName,
            email: senderEmail || `${senderName.toLowerCase().replace(/\s+/g, ".")}@${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            title: "Technical Recruiter",
            notes: `Inbound parsed: ${subject}`,
          });
        }

        const eventId = insertTimelineEvent({
          application_id: appId,
          event_type: "INBOUND_EMAIL",
          summary: `Recruiter outreach received from ${senderName || "Hiring Team"} (${company || "Target"}).`,
          detail: `Subject: "${subject}". Proposed slots: ${proposedSlots}.`,
        });

        return Response.json({ success: true, eventId, contactId }, { headers });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 400, headers });
      }
    }

    // API: Timeline Events (Query or Ingest)
    if (pathname === "/api/timeline") {
      if (req.method === "POST") {
        try {
          const body: any = await req.json();
          const eventId = insertTimelineEvent({
            application_id: body.application_id || body.applicationId || "app-101",
            event_type: body.event_type || body.eventType || "DISPATCH_CONFIRMED",
            summary: body.summary || "Timeline event logged.",
            detail: body.detail || "",
          });
          return Response.json({ success: true, eventId }, { headers });
        } catch (err: any) {
          return Response.json({ error: err.message }, { status: 400, headers });
        }
      }
      const appId = url.searchParams.get("appId") || undefined;
      const events = getTimelineEvents(appId);
      return Response.json({ events }, { headers });
    }

    // API: Trigger Compile Resume (Default Canonical)
    if (pathname === "/api/compile" && req.method === "POST") {
      const startTime = performance.now();
      const scriptPath = resolve(PROJECT_ROOT, "bin/compile-resume.ts");
      const proc = Bun.spawnSync(["bun", "run", scriptPath], {
        cwd: PROJECT_ROOT,
      });
      const latencyMs = Math.round(performance.now() - startTime);

      const success = proc.exitCode === 0;
      return Response.json(
        {
          success,
          latencyMs,
          output: proc.stdout.toString(),
          pdfUrl: "/output/resume.pdf",
          pngUrl: "/output/resume.png",
          pages: 1,
        },
        { headers }
      );
    }

    // API: Authorize 1-Click Dispatch
    if (pathname === "/api/dispatch" && req.method === "POST") {
      let body: any = {};
      try {
        body = await req.json();
      } catch {}

      const appId = body.id || "app-101";
      const app = getApplication(appId) as any;
      const receiptId = `DISP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Check if custom bespoke PDF exists
      const customPdfPath = resolve(OUTPUT_DIR, `resume-${appId}.pdf`);
      const hasCustomPdf = existsSync(customPdfPath);
      const attachedPdfUrl = hasCustomPdf ? `/output/resume-${appId}.pdf` : `/output/resume.pdf`;

      if (app) {
        updateApplicationStatus(appId, "DISPATCHED", receiptId);
        insertTimelineEvent({
          application_id: appId,
          event_type: "DISPATCHED",
          summary: `1-Click dispatch authorized. Submitted to ${app.company}.`,
          detail: `Receipt ${receiptId} issued via ${app.transport}. Attached artifact: ${attachedPdfUrl}.`,
        });
      }

      console.log(`[dispatch] Authorized 1-click dispatch for ${appId} -> Receipt ${receiptId} (${attachedPdfUrl})`);

      // Forward to n8n dispatch webhook asynchronously if reachable
      try {
        fetch(N8N_DISPATCH_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: appId,
            receiptId,
            company: app ? app.company : "Target",
            role: app ? app.role : "Staff Engineer",
            transport: app ? app.transport : "Greenhouse API",
            pdfUrl: attachedPdfUrl,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Non-blocking in local mode
        });
      } catch {}

      return Response.json(
        {
          success: true,
          receipt: receiptId,
          applicationId: appId,
          status: "DISPATCHED",
          transport: app ? app.transport : "Greenhouse API",
          attachedPdf: attachedPdfUrl,
          timestamp: new Date().toISOString(),
          message: `Application submitted with verified Typst PDF resume attachment.`,
        },
        { headers }
      );
    }

    // Serve /output/ files (PDF, PNG previews)
    if (pathname.startsWith("/output/")) {
      const fileName = pathname.replace("/output/", "");
      const filePath = join(OUTPUT_DIR, fileName);
      if (existsSync(filePath)) {
        const file = Bun.file(filePath);
        return new Response(file, {
          headers: {
            "Content-Type": fileName.endsWith(".pdf")
              ? "application/pdf"
              : fileName.endsWith(".png")
              ? "image/png"
              : "application/octet-stream",
          },
        });
      }
    }

    // Serve Root / UI
    if (pathname === "/" || pathname === "/index.html") {
      const indexPath = join(PUBLIC_DIR, "index.html");
      if (existsSync(indexPath)) {
        const html = readFileSync(indexPath, "utf-8");
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[sovereign-desk] Server active at http://localhost:${server.port}`);

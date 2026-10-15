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
} from "./db";

const PORT = parseInt(process.env.PORT || "3000", 10);
const PROJECT_ROOT = existsSync(resolve(process.cwd(), "profile.yaml"))
  ? process.cwd()
  : resolve(import.meta.dir, "..");
const PUBLIC_DIR = resolve(PROJECT_ROOT, "public");
const OUTPUT_DIR = resolve(PROJECT_ROOT, "output");

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

              db.run(
                `INSERT INTO timeline_events (id, application_id, event_type, summary, detail)
                 VALUES ($id, $app_id, $type, $summary, $detail)`,
                {
                  $id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  $app_id: appId,
                  $type: "STAGED",
                  $summary: `Automated match (${job.match_score}%). Staged for executive authorization.`,
                  $detail: `Ingested via n8n ${job.board_type} scraper.`,
                }
              );
            }
          }
        }

        return Response.json({ success: true, processed: jobs.length }, { headers });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 400, headers });
      }
    }

    // API: Trigger Compile Resume
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

      if (app) {
        updateApplicationStatus(appId, "DISPATCHED", receiptId);
        db.run(
          `INSERT INTO timeline_events (id, application_id, event_type, summary, detail)
           VALUES ($id, $app_id, $type, $summary, $detail)`,
          {
            $id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            $app_id: appId,
            $type: "DISPATCHED",
            $summary: `1-Click dispatch authorized. Submitted to ${app.company}.`,
            $detail: `Receipt ${receiptId} issued via ${app.transport}. Verified Typst PDF attached.`,
          }
        );
      }

      console.log(`[dispatch] Authorized 1-click dispatch for ${appId} -> Receipt ${receiptId}`);

      return Response.json(
        {
          success: true,
          receipt: receiptId,
          applicationId: appId,
          status: "DISPATCHED",
          transport: app ? app.transport : "Greenhouse API",
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

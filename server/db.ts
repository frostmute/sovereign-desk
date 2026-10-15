import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const baseDir = existsSync(resolve(process.cwd(), "profile.yaml"))
  ? process.cwd()
  : resolve(import.meta.dir, "..");
const DB_PATH = process.env.DB_PATH || resolve(baseDir, "data/sovereign.sqlite");

const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS job_postings (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    board_type TEXT,
    external_url TEXT,
    raw_content TEXT,
    match_score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    match_score INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    transport TEXT,
    staged_at TEXT,
    receipt_id TEXT,
    dispatched_at TEXT,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES job_postings(id)
  );

  CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    application_id TEXT,
    event_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    detail TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    linkedin_url TEXT,
    notes TEXT
  );
`);

// Seed default applications if empty
const count = db.query("SELECT COUNT(*) as count FROM applications").get() as { count: number };
if (count.count === 0) {
  const insertJob = db.prepare(`
    INSERT OR REPLACE INTO job_postings (id, company, title, location, board_type, external_url, match_score)
    VALUES ($id, $company, $title, $location, $board_type, $external_url, $match_score)
  `);

  insertJob.run({
    $id: "gh-anthropic-101",
    $company: "Anthropic",
    $title: "Staff Systems Engineer, Cluster Orchestration",
    $location: "San Francisco, CA / Remote",
    $board_type: "greenhouse",
    $external_url: "https://boards.greenhouse.io/anthropic/jobs/101",
    $match_score: 96,
  });

  insertJob.run({
    $id: "ashby-modal-102",
    $company: "Modal Labs",
    $title: "Senior Distributed Systems Infrastructure",
    $location: "Remote (US)",
    $board_type: "ashby",
    $external_url: "https://jobs.ashbyhq.com/modal/102",
    $match_score: 92,
  });

  const insertApp = db.prepare(`
    INSERT INTO applications (id, job_id, company, role, match_score, status, transport, staged_at)
    VALUES ($id, $job_id, $company, $role, $match_score, $status, $transport, $staged_at)
  `);

  insertApp.run({
    $id: "app-101",
    $job_id: "gh-anthropic-101",
    $company: "Anthropic",
    $role: "Staff Systems Engineer, Cluster Orchestration",
    $match_score: 96,
    $status: "PENDING_AUTHORIZATION",
    $transport: "Greenhouse API",
    $staged_at: "07:15 AM",
  });

  insertApp.run({
    $id: "app-102",
    $job_id: "ashby-modal-102",
    $company: "Modal Labs",
    $role: "Senior Distributed Systems Infrastructure",
    $match_score: 92,
    $status: "PENDING_AUTHORIZATION",
    $transport: "Ashby API",
    $staged_at: "07:42 AM",
  });

  const insertTimeline = db.prepare(`
    INSERT INTO timeline_events (id, application_id, event_type, summary, detail)
    VALUES ($id, $app_id, $type, $summary, $detail)
  `);

  insertTimeline.run({
    $id: "evt-1",
    $app_id: "app-101",
    $type: "STAGED",
    $summary: "Role matched criteria (96%) and staged for executive review.",
    $detail: "Profile matched Kubernetes, Rust, and High-Throughput Distributed Systems.",
  });
}

export function getApplications() {
  return db.query("SELECT * FROM applications ORDER BY match_score DESC").all();
}

export function getApplication(id: string) {
  return db.query("SELECT * FROM applications WHERE id = $id").get({ $id: id });
}

export function updateApplicationStatus(id: string, status: string, receiptId?: string) {
  db.run(
    `UPDATE applications
     SET status = $status, receipt_id = $receiptId, dispatched_at = CURRENT_TIMESTAMP
     WHERE id = $id`,
    { $id: id, $status: status, $receiptId: receiptId || null }
  );
}

export function insertTimelineEvent(event: {
  application_id: string;
  event_type: string;
  summary: string;
  detail?: string;
}) {
  const id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  db.run(
    `INSERT INTO timeline_events (id, application_id, event_type, summary, detail)
     VALUES ($id, $app_id, $type, $summary, $detail)`,
    {
      $id: id,
      $app_id: event.application_id,
      $type: event.event_type,
      $summary: event.summary,
      $detail: event.detail || "",
    }
  );
  return id;
}

export function getTimelineEvents(applicationId?: string) {
  if (applicationId) {
    return db
      .query("SELECT * FROM timeline_events WHERE application_id = $id ORDER BY timestamp DESC")
      .all({ $id: applicationId });
  }
  return db.query("SELECT * FROM timeline_events ORDER BY timestamp DESC LIMIT 50").all();
}

export function insertContact(contact: {
  id?: string;
  company: string;
  name: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
}) {
  const id = contact.id || `ct-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  db.run(
    `INSERT OR REPLACE INTO contacts (id, company, name, title, email, linkedin_url, notes)
     VALUES ($id, $company, $name, $title, $email, $linkedin_url, $notes)`,
    {
      $id: id,
      $company: contact.company,
      $name: contact.name,
      $title: contact.title || "",
      $email: contact.email || "",
      $linkedin_url: contact.linkedin_url || "",
      $notes: contact.notes || "",
    }
  );
  return id;
}

export function getContacts(company?: string) {
  if (company) {
    return db.query("SELECT * FROM contacts WHERE company = $comp").all({ $comp: company });
  }
  return db.query("SELECT * FROM contacts ORDER BY company ASC").all();
}

export function insertJobPosting(job: {
  id: string;
  company: string;
  title: string;
  location?: string;
  board_type: string;
  external_url?: string;
  raw_content?: string;
  match_score?: number;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO job_postings (id, company, title, location, board_type, external_url, raw_content, match_score)
    VALUES ($id, $company, $title, $location, $board_type, $external_url, $raw_content, $match_score)
  `);
  stmt.run({
    $id: job.id,
    $company: job.company,
    $title: job.title,
    $location: job.location || "Remote",
    $board_type: job.board_type,
    $external_url: job.external_url || "",
    $raw_content: job.raw_content || "",
    $match_score: job.match_score || 0,
  });
}

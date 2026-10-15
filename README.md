# Sovereign Desk

> **Autonomous Remote Work Search Assistant & Executive Dossier Engine**  
> Air-gapped, self-hosted talent operations for senior engineers and technology leaders. Zero data leakage, sub-second mathematical resume compilation, and high-density editorial briefing.

---

## Table of Contents

1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [System Architecture](#2-system-architecture)
3. [Repository Layout](#3-repository-layout)
4. [Prerequisites & Installation](#4-prerequisites--installation)
5. [Candidate Profile Substrate (`profile.yaml`)](#5-candidate-profile-substrate-profileyaml)
6. [Typst Precision Resume Engine (`templates/resume.typ`)](#6-typst-precision-resume-engine-templatesresumetyp)
7. [CLI Precision Compiler (`bin/compile-resume.ts`)](#7-cli-precision-compiler-bincompile-resumets)
8. [Sovereign Desk Server & Editorial UI (`server/index.ts`)](#8-sovereign-desk-server--editorial-ui-serverindexts)
9. [n8n Board Scraping Automation (`n8n-workflows/`)](#9-n8n-board-scraping-automation-n8n-workflows)
10. [REST API & Webhook Specification](#10-rest-api--webhook-specification)
11. [Data Storage & SQLite Schema (`server/db.ts`)](#11-data-storage--sqlite-schema-serverdbts)
12. [Docker Compose & Multi-Container Topology](#12-docker-compose--multi-container-topology)
13. [Operational Runbook & Troubleshooting](#13-operational-runbook--troubleshooting)

---

## 1. Executive Summary & Core Philosophy

Job seekers in competitive, senior remote technology markets face a structural failure mode:

- **The Spray-and-Pray Trap:** Mass AI job application tools blast hundreds of generic resumes into Applicant Tracking Systems (ATS), triggering anti-bot heuristics, exhausting recruiter goodwill, and delivering near-zero yield on senior, high-compensation roles.
- **The Manual Friction Sink:** Bespoke tailoring, cover letter authoring, and multi-channel follow-up demand 20–30 hours per week of repetitive administrative labor.
- **Privacy & Telemetry Leaks:** Commercial job trackers (Huntr, Teal, Simplify) force manual card-moving on cartoonish Kanban boards while selling compensation expectations and resume records to third-party ad networks.

### The Sovereign Desk Approach

1. **Quality Over Volume:** 3–5 bespoke, mathematically verified dossiers per day tailored around authentic career milestones outperform 50 generic AI blasts.
2. **Sub-Second Mathematical Compilation:** Resumes compile directly from `profile.yaml` via **Typst** in under 1 second. Unlike generative LLMs that invent layout hacks or hallucinate credentials, Typst enforces strict typographical leading, Harvard serif aesthetics, and guaranteed single-page compliance.
3. **Air-Gapped Sovereign Storage:** All records, contact lists, recruiter threads, and credentials reside on your local machine in SQLite.
4. **Strict Human-in-the-Loop:** Discovery, filtering, and dossier drafting execute autonomously; outbound dispatch requires explicit **1-click executive authorization**.
5. **Classified Editorial Aesthetic:** Replaces consumer SaaS cards with a dark, high-contrast, editorial intelligence dossier interface.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LOCAL DOCKER / HOST RUNTIME                           │
│                                                                                 │
│   ┌─────────────────────────────┐             ┌─────────────────────────────┐   │
│   │   Self-Hosted n8n Engine    │             │    Sovereign Desk Server    │   │
│   │   (Port 5678)               │             │    (Port 3000)              │   │
│   │                             │             │                             │   │
│   │  • Greenhouse Board Scraper │  Webhooks   │  • Native Bun HTTP Server   │   │
│   │  • Ashby API Board Scraper  ├────────────>│  • Local SQLite Store       │   │
│   │  • IMAP Inbox Watcher       │             │  • Typst CLI Child Process  │   │
│   │  • Outbound Dispatch Hooks  │<────────────┤  • Editorial UI Static Host │   │
│   └─────────────────────────────┘   Dispatch  └──────────────┬──────────────┘   │
│                                                              │                  │
└──────────────────────────────────────────────────────────────┼──────────────────┘
                                                               │
                                                 Local HTTP    │ http://localhost:3000
                                                               ▼
                                                ┌─────────────────────────────┐
                                                │    Dark Editorial Web UI    │
                                                │  • Morning Briefing Dossier │
                                                │  • Urgent Decision Queue    │
                                                │  • Literary Bullet Diff     │
                                                │  • 1-Click Dispatch Actions │
                                                └─────────────────────────────┘
```

---

## 3. Repository Layout

```
sovereign-desk/
├── profile.yaml                # Canonical candidate career substrate & constraints
├── templates/
│   └── resume.typ              # Harvard-style 1-page Typst resume template
├── bin/
│   └── compile-resume.ts       # Sub-second Typst CLI compiler tool
├── server/
│   ├── index.ts                # Bun HTTP server, API endpoints, static assets
│   └── db.ts                   # bun:sqlite schema, queries, application state
├── public/
│   └── index.html              # Dark editorial intelligence executive dashboard
├── n8n-workflows/
│   ├── README.md               # Workflow integration guide
│   ├── greenhouse-board-scraper.json # Automated Greenhouse board ingestion
│   └── ashby-board-scraper.json      # Automated Ashby board ingestion
├── docker/
│   └── Dockerfile.desk         # Production Bun + Typst Debian container
├── docker-compose.yml          # Multi-container orchestration (n8n + desk)
├── package.json                # Run scripts and dependencies
├── docs/
│   └── remote-work-search-assistant.md # Complete architectural design spec
└── .gitignore                  # Excludes node_modules/, output/, data/
```

---

## 4. Prerequisites & Installation

### Local Host Requirements

- **Bun** (v1.2+): Fast JavaScript/TypeScript runtime with native SQLite support.
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Typst** (v0.15+): Modern mathematical typesetting engine.
  ```bash
  # Prebuilt binary or package manager:
  # macOS (via GitHub release asset):
  gh release download v0.15.1 --repo typst/typst --pattern 'typst-*-apple-darwin.tar.xz' --dir /tmp
  tar -xf /tmp/typst-*-apple-darwin.tar.xz -C /tmp && cp /tmp/typst-*/typst ~/.local/bin/typst
  
  # Verify installation
  typst --version
  ```
- **Docker & Docker Compose** (Optional, for running self-hosted n8n):
  Docker Desktop or Docker Engine v24+.

### Installation

```bash
cd sovereign-desk
bun install
```

---

## 5. Candidate Profile Substrate (`profile.yaml`)

All candidate data originates from `profile.yaml`. It is the single source of truth for the Typst compiler and matching engine.

```yaml
basics:
  name: "Marcus Vance"
  headline: "Staff Distributed Systems & Infrastructure Engineer"
  email: "marcus.vance@protonmail.internal"
  phone: "+1 (415) 890-4321"
  location: "San Francisco, CA (Strictly Remote)"
  github: "github.com/marcusvance"
  linkedin: "linkedin.com/in/marcus-vance-infra"
  website: "marcusvance.io"

target_criteria:
  target_roles:
    - "Staff Distributed Systems Engineer"
    - "Principal Infrastructure Engineer"
  min_base_salary_usd: 280000
  target_total_comp_usd: 450000
  strict_remote: true
  allowed_timezones: ["UTC-8", "UTC-7", "UTC-6", "UTC-5", "UTC-4"]
  disallowed_stacks: ["PHP", "Ruby on Rails", "Java 8", "Oracle SQL"]

skills:
  - category: "Systems & Kernels"
    items: ["Rust", "Go", "C++20", "eBPF", "Linux Internals", "POSIX Systems"]
  - category: "Distributed Infrastructure"
    items: ["Raft Consensus", "Kubernetes", "gRPC / Protobuf", "Kafka", "ClickHouse"]

experience:
  - company: "VoxelScale AI"
    role: "Staff Infrastructure Engineer"
    location: "Remote (San Francisco, CA)"
    start_date: "2023"
    end_date: "Present"
    summary: "Architected distributed orchestration backplane for 16,384 GPU training clusters."
    achievements:
      - "Built eBPF kernel network scheduler reducing tail latency by 41% across RDMA fabrics."
      - "Architected checkpoint engine saving $1.4M/year in wasted GPU wall-clock time."
```

---

## 6. Typst Precision Resume Engine (`templates/resume.typ`)

The Typst template uses Harvard formatting standards:
- **Typography:** `New Computer Modern` serif font at `8.8pt` with `0.35em` line spacing.
- **Geometry:** `0.45in` horizontal margins, `0.38in` vertical margins.
- **Dynamic Parameter Injection:** `#let profile-path = sys.inputs.at("profile", default: "/profile.yaml")`
- **Strict Single-Page Discipline:** All sections, section dividers (`0.5pt` rule), and bullet points are balanced to guarantee an exact 1-page artifact without multi-page spillover.

---

## 7. CLI Precision Compiler (`bin/compile-resume.ts`)

The executable CLI compiler handles profile loading, argument parsing, Typst execution, latency benchmarking, and strict page count enforcement.

### Usage

```bash
# Compile default profile.yaml to output/resume.pdf
bun run bin/compile-resume.ts

# Enforce strict single-page gate (fails with exit code 1 if pages > 1)
bun run bin/compile-resume.ts --strict-one-page

# Render high-resolution PNG image preview for web viewing
bun run bin/compile-resume.ts --output output/resume.png --format png

# Custom profile and template paths
bun run bin/compile-resume.ts --profile path/to/profile.yaml --template templates/resume.typ
```

### Compiler Output Example

```
────────────────────────────────────────────────────────────
  Sovereign Desk — Resume Precision Compiler
────────────────────────────────────────────────────────────
  Profile:       .../sovereign-desk/profile.yaml
  Template:      .../sovereign-desk/templates/resume.typ
  Artifact:      .../sovereign-desk/output/resume.pdf (49.6 KB)
  Compilation:   688 ms (Target < 1000 ms)
  Page Count:    1 [PASS — Perfect 1-Page]
────────────────────────────────────────────────────────────
```

---

## 8. Sovereign Desk Server & Editorial UI (`server/index.ts`)

The native Bun server hosts the REST API, serves static editorial UI files, and executes child processes on demand.

### Starting the Server

```bash
bun run start
```

Access the dashboard at **`http://localhost:3000`**.

### Editorial UI Capabilities

- **Morning Briefing:** Consolidated summary of staged packages, match scores, and parsed recruiter replies.
- **Urgent Decision Queue:** High-priority items awaiting executive sign-off.
- **Literary Bullet Diff:** Inspect baseline resume bullets side-by-side with bespoke tailored adaptations before submission.
- **Live Typst Recompilation:** Real-time recompilation button benchmarking latency directly in the browser header.
- **1-Click Dispatch:** Interactive authorization issuing authenticated cryptographic receipt IDs.

---

## 9. n8n Board Scraping Automation (`n8n-workflows/`)

Pre-built workflow JSON definitions reside in `n8n-workflows/`:

1. **`greenhouse-board-scraper.json`:**
   - **Trigger:** Cron schedule (every 4 hours).
   - **Target:** `https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true`.
   - **Filter:** Evaluates remote classification and senior engineering keywords (`systems`, `infrastructure`, `distributed`, `staff`).
   - **Ingestion:** Posts normalized payload to `http://host.docker.internal:3000/api/webhooks/jobs`.

2. **`ashby-board-scraper.json`:**
   - **Trigger:** Cron schedule (every 4 hours).
   - **Target:** `https://api.ashbyhq.com/posting-api/job-board/{organization}`.
   - **Filter:** Filters senior infrastructure postings and computes baseline match score.
   - **Ingestion:** Transmits opportunities to the local Sovereign Desk server webhook.

### Importing Workflows to n8n

1. Start n8n: `docker compose up -d n8n`
2. Open `http://localhost:5678` in your browser.
3. In the n8n sidebar, navigate to **Workflows** → **Import from File**.
4. Select `n8n-workflows/greenhouse-board-scraper.json` or `n8n-workflows/ashby-board-scraper.json`.
5. Activate the workflow.

---

## 10. REST API & Webhook Specification

### `GET /api/status`
Returns real-time server telemetry and application counts.
```json
{
  "status": "OPERATIONAL",
  "engine": "Sovereign Desk v1.0",
  "compiler": "Typst 0.15.1",
  "activeApplications": 3,
  "ingestedJobs": 1,
  "pendingDecisions": 3,
  "lastSync": "10:24:24 AM",
  "mode": "SOVEREIGN_AIRGAP"
}
```

### `GET /api/applications`
Returns all active applications and their current states from SQLite.

### `POST /api/compile`
Triggers an immediate background Typst compilation pass.
```json
{
  "success": true,
  "latencyMs": 744,
  "output": "...",
  "pdfUrl": "/output/resume.pdf",
  "pngUrl": "/output/resume.png",
  "pages": 1
}
```

### `POST /api/dispatch`
Authorizes 1-click application transmission and returns an audit receipt.
- **Request Body:** `{"id": "app-101"}`
- **Response:**
```json
{
  "success": true,
  "receipt": "DISP-Z1ISX9",
  "applicationId": "app-101",
  "status": "DISPATCHED",
  "transport": "Greenhouse API",
  "timestamp": "2026-10-15T15:07:48.798Z",
  "message": "Application submitted with verified Typst PDF resume attachment."
}
```

### `POST /api/webhooks/jobs`
Ingests scraped opportunities from n8n or external crawlers into SQLite.
- **Request Body:**
```json
[
  {
    "id": "gh-998811",
    "company": "Vercel",
    "title": "Staff Distributed Systems Engineer",
    "location": "Remote (US)",
    "board_type": "greenhouse",
    "external_url": "https://boards.greenhouse.io/vercel/jobs/998811",
    "match_score": 95
  }
]
```

---

## 11. Data Storage & SQLite Schema (`server/db.ts`)

Data is stored locally in `data/sovereign.sqlite` via `bun:sqlite`:

```sql
CREATE TABLE job_postings (
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

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  match_score INTEGER DEFAULT 0,
  status TEXT NOT NULL,           -- PENDING_AUTHORIZATION, DISPATCHED, INTERVIEWING
  transport TEXT,                -- Greenhouse API, Ashby API, Lever API
  staged_at TEXT,
  receipt_id TEXT,
  dispatched_at TEXT,
  notes TEXT,
  FOREIGN KEY (job_id) REFERENCES job_postings(id)
);

CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY,
  application_id TEXT,
  event_type TEXT NOT NULL,       -- DISCOVERED, STAGED, DISPATCHED, RECRUITER_REPLY
  summary TEXT NOT NULL,
  detail TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  notes TEXT
);
```

---

## 12. Docker Compose & Multi-Container Topology

Run the complete isolated stack via Docker Compose:

```bash
docker compose up -d
```

### Services Defined

1. **`n8n`** (`ports: 5678:5678`): Self-hosted automation engine with workflow persistence mounted to volume `n8n_data`.
2. **`desk`** (`ports: 3000:3000`): Sovereign Desk Server running Bun and Typst, mounted to `./data` and `./output`.

---

## 13. Operational Runbook & Troubleshooting

### Resume Spilling Over to Page 2
If adding extensive achievements causes page overflow:
1. Open `templates/resume.typ`.
2. Tune font size from `8.8pt` to `8.5pt`:
   ```typst
   #set text(font: "New Computer Modern", size: 8.5pt, fill: rgb("#111111"))
   ```
3. Adjust vertical margins from `0.38in` to `0.35in`:
   ```typst
   #set page(paper: "us-letter", margin: (x: 0.45in, top: 0.35in, bottom: 0.35in))
   ```
4. Run `bun run compile:strict` to verify 1-page pass.

### n8n Webhook Connection (`host.docker.internal`)
- Inside Docker containers, the host machine's port 3000 is accessible via `http://host.docker.internal:3000`.
- On Linux Docker without host resolution, run containers with `--network host` or map host IP via `extra_hosts`.

---

## License

MIT License. Sovereign, private, and open source.

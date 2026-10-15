# Sovereign Desk

> **Autonomous Remote Work Search Assistant & Executive Dossier Engine**  
> Air-gapped, self-hosted talent operations for senior engineers and technology leaders. Zero data leakage, sub-second mathematical resume compilation, and high-density editorial briefing.

<img width="1274" height="1711" alt="sovereign-desk" src="https://github.com/user-attachments/assets/3cf3f762-7dfe-4a7a-8c9a-0946d954371f" /><img width="1274" height="1640" alt="sovereign-desk-2" src="https://github.com/user-attachments/assets/c7f9fd70-65bf-4b7f-977a-d02e5a573b4b" />

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
12. [Infiltration Engine & Live Interview War Room (`public/war-room.html`)](#12-infiltration-engine--live-interview-war-room-publicwar-roomhtml)
13. [Docker Compose & Multi-Container Topology](#13-docker-compose--multi-container-topology)
14. [Operational Runbook & Troubleshooting](#14-operational-runbook--troubleshooting)

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
│   │  • Target Repo Watcher      │             │  • Typst CLI Child Process  │   │
│   │  • Blog RSS Feed Ingestion  │             │  • Infiltration Intelligence│   │
│   │  • IMAP Inbox Watcher       │             │  • Editorial UI Static Host │   │
│   │  • Outbound Dispatch Hooks  │<────────────┤  • War Room HUD Static Host │   │
│   └─────────────────────────────┘   Dispatch  └──────────────┬──────────────┘   │
│                                                              │                  │
└──────────────────────────────────────────────────────────────┼──────────────────┘
                                                               │
                                                 Local HTTP    │ http://localhost:3000
                                                               ▼
                                ┌───────────────────────────────────────────────┐
                                │       Dark Editorial High-Density HUDs        │
                                │                                               │
                                │ • Executive Morning Briefing (/)              │
                                │   - Curated Leads & 1-Page Exact Typst Diff   │
                                │   - Urgent Decision Queue & 1-Click Dispatch  │
                                │                                               │
                                │ • Interview War Room & Teleprompter (/war-room)│
                                │   - High-Leverage Architectural Pillars       │
                                │   - Target Interviewer Dossier & Warning Notes│
                                │   - Instant Fuzzy Teleprompter Stream (/ key) │
                                │   - Real-Time Commits & Engineering RSS Posts │
                                └───────────────────────────────────────────────┘
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
│   ├── db.ts                   # bun:sqlite schema, queries, application state
│   └── diff-engine.ts          # Literary Bullet Diff & keyword alignment engine
├── public/
│   ├── index.html              # Dark editorial intelligence executive dashboard
│   └── war-room.html           # Live interview teleprompter & infiltration HUD
├── n8n-workflows/
│   ├── README.md               # Workflow integration guide
│   ├── greenhouse-board-scraper.json # Automated Greenhouse board ingestion
│   ├── ashby-board-scraper.json      # Automated Ashby board ingestion
│   ├── imap-inbox-watcher.json       # Recruiter email thread monitor
│   ├── dispatch-executor.json        # Outbound multipart submission hook
│   └── target-repo-watcher.json      # Target repo commit watcher & talking point extractor
├── docker/
│   └── Dockerfile.desk         # Production Bun + Typst Debian container
├── docker-compose.yml          # Multi-container orchestration (n8n + desk)
├── package.json                # Run scripts and dependencies
├── docs/
│   └── remote-work-search-assistant.md # Complete architectural design spec
└── .gitignore                  # Excludes node_modules/, output/, data/, *.log
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
- **War Room Teleprompter Integration:** Dynamic launch triggers in both the header and Typst preview bar, carrying the active application identifier directly into the live Interview War Room HUD (`/war-room.html?appId=...`).

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

3. **`target-repo-watcher.json` (Milestone 5 Infiltration Engine):**
   - **Trigger:** Cron schedule (every 2 hours).
   - **Target:** Target engineering team GitHub repositories (e.g., `vllm-project/vllm`, `modal-labs/modal-client`, `kubernetes-sigs/kueue`).
   - **Extraction:** Monitors commit history for performance, kernel, and scheduling changes, synthesizing tactical talking points against candidate substrate milestones.
   - **Ingestion:** Transmits intelligence payloads to `http://host.docker.internal:3000/api/webhooks/talking-points`.

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

### `GET /api/war-room`
Aggregates target application intelligence, interviewer contacts with behavioral/technical bias notes, monitored GitHub repositories, engineering blog RSS feeds, tactical talking points, literary bullet diff report, and candidate teleprompter pillars for the active interview.
- **Query Parameters:** `appId` (optional, defaults to primary active application).
- **Response:**
```json
{
  "application": {
    "id": "app-101",
    "company": "Anthropic",
    "role": "Staff Systems Engineer, Cluster Orchestration",
    "match_score": 96,
    "status": "PENDING_AUTHORIZATION",
    "transport": "Greenhouse API"
  },
  "contacts": [
    {
      "id": "c-101",
      "company": "Anthropic",
      "name": "Dr. Elena Rostova",
      "title": "Principal Cluster Systems Lead",
      "email": "elena.rostova@anthropic.com",
      "linkedin_url": "https://linkedin.com/in/elena-rostova-systems",
      "notes": "PhD Distributed Systems. Built Anthropic's scheduler. Highly receptive to deterministic gang-scheduling and Raft consensus discussions."
    }
  ],
  "repositories": [
    {
      "id": "repo-anthropic-1",
      "company": "Anthropic",
      "repo_name": "vllm-project/vllm",
      "github_url": "https://github.com/vllm-project/vllm",
      "branch": "main",
      "stars": 28400,
      "recent_activity_summary": "14 commits this week on PagedAttention memory fragmentation and chunked prefill scheduler."
    }
  ],
  "feeds": [
    {
      "id": "feed-anthropic-1",
      "company": "Anthropic",
      "feed_name": "Anthropic Engineering Research",
      "feed_url": "https://www.anthropic.com/research/rss.xml",
      "recent_posts_count": 6,
      "last_post_title": "Core Scheduler Invariants for Distributed Model Serving"
    }
  ],
  "talkingPoints": [
    {
      "id": "tp-anthropic-1",
      "company": "Anthropic",
      "category": "SCHEDULING_ARCHITECTURE",
      "headline": "Anthropic vLLM Chunked Prefill vs. Your eBPF Scheduler",
      "detail": "Anthropic's latest commits optimize chunked prefill chunk sizes. Anchor to your Rust/eBPF inference router (65,000 QPS) handling dynamic token chunking.",
      "source_url": "https://github.com/vllm-project/vllm/pull/8921",
      "source_type": "GITHUB_COMMIT"
    }
  ],
  "teleprompterSummary": {
    "candidateName": "Garry 'Alex' Mercer",
    "candidateRole": "Staff Distributed Systems & AI Infrastructure Engineer",
    "targetRole": "Staff Systems Engineer, Cluster Orchestration",
    "targetCompany": "Anthropic",
    "matchScore": 96,
    "highLeveragePillars": [
      "Custom Rust/eBPF inference router (65,000 QPS, 18ms P99 latency)",
      "Dynamic speculative decoding across 256 H100 SXM5 GPUs (2.4x throughput)",
      "Host NVMe checkpoint caching Kubernetes CSI driver (3.8m -> 4.2s cold start)",
      "Zero-copy LSM-tree compaction in Rust (62% write amplification reduction)",
      "Multi-region Raft consensus with zero partition incidents over 18 months"
    ]
  }
}
```

### `GET /api/infiltration`
Returns real-time telemetry for monitored target repositories, engineering blog RSS feeds, and synthesized talking points.
- **Query Parameters:** `company` (optional filter).
- **Response:**
```json
{
  "status": "ACTIVE_SCANNING",
  "monitoredRepositories": [
    {
      "id": "repo-anthropic-1",
      "company": "Anthropic",
      "repo_name": "vllm-project/vllm",
      "github_url": "https://github.com/vllm-project/vllm",
      "stars": 28400
    }
  ],
  "monitoredFeeds": [
    {
      "id": "feed-anthropic-1",
      "company": "Anthropic",
      "feed_name": "Anthropic Engineering Research",
      "recent_posts_count": 6
    }
  ],
  "totalTalkingPoints": 4,
  "lastScanTimestamp": "2026-10-15T15:20:00.000Z"
}
```

### `POST /api/webhooks/talking-points`
Ingests infiltration signals and tactical talking points from n8n workflows (`target-repo-watcher.json`) or autonomous crawlers into SQLite, logging a timeline event.
- **Request Body:**
```json
[
  {
    "company": "Anthropic",
    "application_id": "app-101",
    "category": "COMMIT_INTELLIGENCE",
    "headline": "vLLM KV-Cache Compaction Merge",
    "detail": "PR #9102 merged 3 hours ago touching KV-cache block allocation. Pivot to your zero-copy LSM memory management experience.",
    "source_url": "https://github.com/vllm-project/vllm/pull/9102",
    "source_type": "GITHUB_COMMIT"
  }
]
```
- **Response:**
```json
{
  "success": true,
  "count": 1,
  "ids": ["tp-1729005600000-8472"]
}
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
  event_type TEXT NOT NULL,       -- DISCOVERED, STAGED, DISPATCHED, RECRUITER_REPLY, INTELLIGENCE_INGESTED
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

CREATE TABLE target_repositories (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  github_url TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  stars INTEGER DEFAULT 0,
  recent_activity_summary TEXT,
  last_scanned_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_rss_feeds (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  feed_name TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  recent_posts_count INTEGER DEFAULT 0,
  last_post_title TEXT,
  last_post_url TEXT,
  last_scanned_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE talking_points (
  id TEXT PRIMARY KEY,
  application_id TEXT,
  company TEXT NOT NULL,
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  detail TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);
```

---

## 12. Infiltration Engine & Live Interview War Room (`public/war-room.html`)

The **Infiltration Engine & Live Interview War Room** provides situational awareness and high-conviction talking points during live technical interviews. When speaking with hiring managers and principal systems engineers, the candidate has an air-gapped, zero-latency heads-up display (HUD) providing deep tactical alignment without looking away from camera.

Launch the War Room via browser at:
```bash
http://localhost:3000/war-room.html?appId=app-101
# or shorthand route
http://localhost:3000/war-room
```

### 1. 5 High-Leverage Strategic Pillars (Pinned Teleprompter)
Positioned in the top echelon of the HUD, 5 unassailable technical achievements are pinned for instantaneous recall. Regardless of what scenario or curveball question an interviewer poses, you can seamlessly anchor back to verified substrate accomplishments:
- **Pillar 1:** Custom Rust/eBPF inference router (65,000 QPS, 18ms P99 latency)
- **Pillar 2:** Dynamic speculative decoding across 256 H100 SXM5 GPUs (2.4x throughput)
- **Pillar 3:** Host NVMe checkpoint caching Kubernetes CSI driver (3.8m -> 4.2s cold start)
- **Pillar 4:** Zero-copy LSM-tree compaction in Rust (62% write amplification reduction)
- **Pillar 5:** Multi-region Raft consensus with zero partition incidents over 18 months

### 2. Tactical Teleprompter Stream & Instant Keyboard Filter (`/` & `Esc`)
- Press **`/`** at any moment during the call to instantly focus the HUD search filter.
- Type any keyword (e.g., `raft`, `ebpf`, `vllm`, `cold start`, `chunked`) to filter talking points, repo commits, and interview notes in **< 50ms**.
- Press **`Esc`** to clear the filter and restore the full intelligence stream.

### 3. Engineering Team Infiltration (GitHub & RSS Ingestion)
- **Commit Watcher:** Integrates with `n8n-workflows/target-repo-watcher.json` to monitor public engineering commits from target companies (`vllm-project/vllm`, `modal-labs/modal-client`).
- **Tactical Talking Points:** Translates recent PR merges and architectural commits directly into candidate milestone anchors (e.g., matching vLLM KV-cache memory commits to your custom LSM compaction work).
- **RSS Feed Tracker:** Ingests official engineering blog feeds, exposing the exact technical challenges the team is actively wrestling with in production.

### 4. Deep Interviewer Dossiers & Technical Biases
- Displays comprehensive dossiers for interviewers: title, email, LinkedIn, background, and specific technical biases (e.g., Dr. Elena Rostova's focus on deterministic schedulers and Raft safety vs. Bernhard Baudry's focus on microVM isolation and cold start minimization).

### 5. Seamless Target Switching
- The header target selector allows switching between active pipeline applications (`app-101` Anthropic, `app-102` Modal Labs, etc.) instantaneously without reloading the page.

---

## 13. Docker Compose & Multi-Container Topology

Run the complete isolated stack via Docker Compose:

```bash
docker compose up -d
```

### Services Defined

1. **`n8n`** (`ports: 5678:5678`): Self-hosted automation engine with workflow persistence mounted to volume `n8n_data`.
2. **`desk`** (`ports: 3000:3000`): Sovereign Desk Server running Bun and Typst, mounted to `./data` and `./output`.

---

## 14. Operational Runbook & Troubleshooting

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

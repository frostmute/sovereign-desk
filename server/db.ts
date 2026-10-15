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

  CREATE TABLE IF NOT EXISTS target_repositories (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    github_url TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    stars INTEGER DEFAULT 0,
    recent_activity_summary TEXT,
    last_scanned_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blog_rss_feeds (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    feed_name TEXT NOT NULL,
    feed_url TEXT NOT NULL,
    recent_posts_count INTEGER DEFAULT 0,
    last_post_title TEXT,
    last_post_url TEXT,
    last_scanned_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS talking_points (
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

// Seed Infiltration & Intelligence Data if empty
const tpCount = db.query("SELECT COUNT(*) as count FROM talking_points").get() as { count: number };
if (tpCount.count === 0) {
  // Seed Interviewer Contacts
  const insertContactStmt = db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company, name, title, email, linkedin_url, notes)
    VALUES ($id, $company, $name, $title, $email, $linkedin_url, $notes)
  `);

  insertContactStmt.run({
    $id: "ct-anthropic-1",
    $company: "Anthropic",
    $name: "Dr. Elena Rostova",
    $title: "VP of Systems Architecture & Cluster Compute",
    $email: "elena.rostova@anthropic.com",
    $linkedin_url: "https://linkedin.com/in/elena-rostova-systems",
    $notes: "Ex-Google Borg TLM. Highly values kernel-level observability, tail-latency metrics, and deterministic scheduling. Dislikes vague hand-waving; asks detailed questions on cache eviction and Raft state machine safety.",
  });

  insertContactStmt.run({
    $id: "ct-anthropic-2",
    $company: "Anthropic",
    $name: "Marcus Vance",
    $title: "Principal Infrastructure Lead",
    $email: "m.vance@anthropic.com",
    $linkedin_url: "https://linkedin.com/in/marcus-vance-infra",
    $notes: "Focuses on checkpointing efficiency and NCCL collective communication across InfiniBand fabrics. Led their live migration initiative.",
  });

  insertContactStmt.run({
    $id: "ct-modal-1",
    $company: "Modal Labs",
    $name: "Bernhard Baudry",
    $title: "VP of Engineering & Runtime Architecture",
    $email: "bernhard@modal.com",
    $linkedin_url: "https://linkedin.com/in/bernhard-baudry",
    $notes: "Creator of microVM isolation primitives. Obsessed with sub-second cold starts, gVisor / Firecracker sandboxing, and custom containerd shims.",
  });

  // Seed Target Repositories
  const insertRepoStmt = db.prepare(`
    INSERT OR REPLACE INTO target_repositories (id, company, repo_name, github_url, branch, stars, recent_activity_summary)
    VALUES ($id, $company, $repo_name, $github_url, $branch, $stars, $recent_activity_summary)
  `);

  insertRepoStmt.run({
    $id: "repo-vllm",
    $company: "Anthropic",
    $repo_name: "vllm-project/vllm",
    $github_url: "https://github.com/vllm-project/vllm",
    $branch: "main",
    $stars: 38400,
    $recent_activity_summary: "Merged PR #8412: PagedAttention v3 kernel with FP8 KV cache support. Active contention on Ray actor worker crash recovery under node failure.",
  });

  insertRepoStmt.run({
    $id: "repo-kueue",
    $company: "Anthropic",
    $repo_name: "kubernetes-sigs/kueue",
    $github_url: "https://github.com/kubernetes-sigs/kueue",
    $branch: "main",
    $stars: 3200,
    $recent_activity_summary: "Hierarchical fair-share scheduling and gang-scheduling primitives across multi-cluster heterogeneous GPU slices.",
  });

  insertRepoStmt.run({
    $id: "repo-modal-client",
    $company: "Modal Labs",
    $repo_name: "modal-labs/modal-client",
    $github_url: "https://github.com/modal-labs/modal-client",
    $branch: "main",
    $stars: 4950,
    $recent_activity_summary: "Commit 72bf9c: Optimized sparse image delta transfers and zero-copy memory mapping for warm GPU microVMs.",
  });

  insertRepoStmt.run({
    $id: "repo-turborepo",
    $company: "Vercel",
    $repo_name: "vercel/turborepo",
    $github_url: "https://github.com/vercel/turborepo",
    $branch: "main",
    $stars: 26100,
    $recent_activity_summary: "Rust daemon remote cache synchronization and micro-task scheduler optimizations with custom IPC.",
  });

  insertRepoStmt.run({
    $id: "repo-triton",
    $company: "Anthropic",
    $repo_name: "openai/triton",
    $github_url: "https://github.com/openai/triton",
    $branch: "main",
    $stars: 14800,
    $recent_activity_summary: "Fused FlashAttention-3 backward pass compiler optimizations for Hopper H100 tensor cores.",
  });

  // Seed Blog RSS Feeds
  const insertFeedStmt = db.prepare(`
    INSERT OR REPLACE INTO blog_rss_feeds (id, company, feed_name, feed_url, recent_posts_count, last_post_title, last_post_url)
    VALUES ($id, $company, $feed_name, $feed_url, $recent_posts_count, $last_post_title, $last_post_url)
  `);

  insertFeedStmt.run({
    $id: "feed-anthropic",
    $company: "Anthropic",
    $feed_name: "Anthropic Research & Engineering",
    $feed_url: "https://anthropic.com/engineering/rss.xml",
    $recent_posts_count: 14,
    $last_post_title: "Zero-Downtime Live Migration of In-Flight Transformer Contexts Across Degraded Clusters",
    $last_post_url: "https://anthropic.com/engineering/live-migration-transformer-contexts",
  });

  insertFeedStmt.run({
    $id: "feed-modal",
    $company: "Modal Labs",
    $feed_name: "Modal Labs Engineering Blog",
    $feed_url: "https://modal.com/blog/feed.xml",
    $recent_posts_count: 22,
    $last_post_title: "How We Built a Distributed GPU Filesystem with 50 GB/s Streaming Read Speeds",
    $last_post_url: "https://modal.com/blog/distributed-gpu-filesystem",
  });

  insertFeedStmt.run({
    $id: "feed-vercel",
    $company: "Vercel",
    $feed_name: "Vercel Engineering",
    $feed_url: "https://vercel.com/blog/engineering/rss.xml",
    $recent_posts_count: 18,
    $last_post_title: "Fast Compute: Cold Start Elimination with V8 Isolates and Custom Rust Proxies",
    $last_post_url: "https://vercel.com/blog/fast-compute-isolates",
  });

  insertFeedStmt.run({
    $id: "feed-stripe",
    $company: "Stripe",
    $feed_name: "Stripe Engineering Blog",
    $feed_url: "https://stripe.com/blog/engineering/rss.xml",
    $recent_posts_count: 31,
    $last_post_title: "Designing Distributed Ledger Consensus for 99.9999% Reliability at Peak Cyber Week",
    $last_post_url: "https://stripe.com/blog/engineering/ledger-consensus-cyber-week",
  });

  // Seed Talking Points
  const insertTpStmt = db.prepare(`
    INSERT OR REPLACE INTO talking_points (id, application_id, company, category, headline, detail, source_url, source_type)
    VALUES ($id, $application_id, $company, $category, $headline, $detail, $source_url, $source_type)
  `);

  insertTpStmt.run({
    $id: "tp-anth-1",
    $application_id: "app-101",
    $company: "Anthropic",
    $category: "ARCHITECTURAL_PARITY",
    $headline: "Pre-Emptive Checkpointing vs NVMe Host Memory Caching",
    $detail: "Their recent engineering blog highlighted 4-minute cluster rebalancing penalties during GPU node failures. Counter with your custom Kubernetes CSI driver from VoxelScale AI: caching quantized model checkpoints in host NVMe memory reduced cold starts from 3.8m to 4.2s.",
    $source_url: "https://anthropic.com/engineering/live-migration-transformer-contexts",
    $source_type: "ENGINEERING_BLOG",
  });

  insertTpStmt.run({
    $id: "tp-anth-2",
    $application_id: "app-101",
    $company: "Anthropic",
    $category: "COMMIT_INTELLIGENCE",
    $headline: "PagedAttention FP8 KV-Cache Contention Workaround",
    $detail: "Recent commit 9d42f0a in vLLM showed memory-pressure worker crash loops. Propose your dynamic speculative decoding architecture (256 H100 GPUs, 2.4x throughput boost, -$1.8M cloud spend) coupled with zero-copy LSM buffers from Hyperion.",
    $source_url: "https://github.com/vllm-project/vllm/commit/9d42f0a",
    $source_type: "GITHUB_COMMIT",
  });

  insertTpStmt.run({
    $id: "tp-anth-3",
    $application_id: "app-101",
    $company: "Anthropic",
    $category: "COUNTER_OBJECTION",
    $headline: "Bypassing Python Ray Deserialization Overheads",
    $detail: "Dr. Elena Rostova favors deterministic C++/Rust bridges over pure Python Ray orchestration. Pitch your eBPF inference router (65,000 QPS, 18ms P99 down from 142ms) to route traffic at the kernel ingress before user-space overheads.",
    $source_url: "https://linkedin.com/in/elena-rostova-systems",
    $source_type: "INTERVIEWER_DOSSIER",
  });

  insertTpStmt.run({
    $id: "tp-anth-4",
    $application_id: "app-101",
    $company: "Anthropic",
    $category: "CONSENSUS_STABILITY",
    $headline: "Multi-Region Raft Quorum Partition Resilience",
    $detail: "Anthropic's multi-cluster queueing in Kueue requires strict quorum guarantees during AWS cross-AZ latency spikes. Leverage your Hyperion Raft refactor: 18 consecutive months with zero partition incidents at 99.999% SLA.",
    $source_url: "https://github.com/kubernetes-sigs/kueue",
    $source_type: "GITHUB_REPO",
  });

  insertTpStmt.run({
    $id: "tp-modal-1",
    $application_id: "app-102",
    $company: "Modal Labs",
    $category: "ARCHITECTURAL_PARITY",
    $headline: "Distributed RootFS Delta Caching vs NVMe CSI Driver",
    $detail: "Modal's 50 GB/s filesystem post solves container rootfs mounting. Correlate directly with your host NVMe memory caching driver reducing container initialization from 3.8m to 4.2s via O_DIRECT memory maps.",
    $source_url: "https://modal.com/blog/distributed-gpu-filesystem",
    $source_type: "ENGINEERING_BLOG",
  });

  insertTpStmt.run({
    $id: "tp-modal-2",
    $application_id: "app-102",
    $company: "Modal Labs",
    $category: "COMMIT_INTELLIGENCE",
    $headline: "MicroVM GPU Memory Snapshot Restoration",
    $detail: "Modal client PR #489 optimizes sparse image delta transfers. Contrast with your zero-copy LSM storage engine compaction in Rust (62% write amplification reduction) and AVX-512 SIMD vector execution primitives.",
    $source_url: "https://github.com/modal-labs/modal-client/commit/72bf9c",
    $source_type: "GITHUB_COMMIT",
  });

  insertTpStmt.run({
    $id: "tp-modal-3",
    $application_id: "app-102",
    $company: "Modal Labs",
    $category: "INTERVIEWER_ALIGNMENT",
    $headline: "MicroVM Isolation vs Kernel Overhead",
    $detail: "Bernhard Baudry values low-overhead Linux kernel virtualization. Connect your eBPF networking telemetry and Cilium CNI routing experience with their microVM network fabric.",
    $source_url: "https://linkedin.com/in/bernhard-baudry",
    $source_type: "INTERVIEWER_DOSSIER",
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

export function getTargetRepositories(company?: string) {
  if (company) {
    return db
      .query("SELECT * FROM target_repositories WHERE company = $comp ORDER BY stars DESC")
      .all({ $comp: company });
  }
  return db.query("SELECT * FROM target_repositories ORDER BY stars DESC").all();
}

export function insertTargetRepository(repo: {
  id?: string;
  company: string;
  repo_name: string;
  github_url: string;
  branch?: string;
  stars?: number;
  recent_activity_summary?: string;
}) {
  const id = repo.id || `repo-${repo.repo_name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
  db.run(
    `INSERT OR REPLACE INTO target_repositories (id, company, repo_name, github_url, branch, stars, recent_activity_summary, last_scanned_at)
     VALUES ($id, $company, $repo_name, $github_url, $branch, $stars, $recent_activity_summary, CURRENT_TIMESTAMP)`,
    {
      $id: id,
      $company: repo.company,
      $repo_name: repo.repo_name,
      $github_url: repo.github_url,
      $branch: repo.branch || "main",
      $stars: repo.stars || 0,
      $recent_activity_summary: repo.recent_activity_summary || "",
    }
  );
  return id;
}

export function getBlogRssFeeds(company?: string) {
  if (company) {
    return db
      .query("SELECT * FROM blog_rss_feeds WHERE company = $comp ORDER BY recent_posts_count DESC")
      .all({ $comp: company });
  }
  return db.query("SELECT * FROM blog_rss_feeds ORDER BY recent_posts_count DESC").all();
}

export function insertBlogRssFeed(feed: {
  id?: string;
  company: string;
  feed_name: string;
  feed_url: string;
  recent_posts_count?: number;
  last_post_title?: string;
  last_post_url?: string;
}) {
  const id = feed.id || `feed-${feed.feed_name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
  db.run(
    `INSERT OR REPLACE INTO blog_rss_feeds (id, company, feed_name, feed_url, recent_posts_count, last_post_title, last_post_url, last_scanned_at)
     VALUES ($id, $company, $feed_name, $feed_url, $recent_posts_count, $last_post_title, $last_post_url, CURRENT_TIMESTAMP)`,
    {
      $id: id,
      $company: feed.company,
      $feed_name: feed.feed_name,
      $feed_url: feed.feed_url,
      $recent_posts_count: feed.recent_posts_count || 0,
      $last_post_title: feed.last_post_title || "",
      $last_post_url: feed.last_post_url || "",
    }
  );
  return id;
}

export function getTalkingPoints(applicationId?: string, company?: string) {
  if (applicationId && company) {
    return db
      .query("SELECT * FROM talking_points WHERE application_id = $appId OR company = $comp ORDER BY created_at DESC")
      .all({ $appId: applicationId, $comp: company });
  }
  if (applicationId) {
    return db
      .query("SELECT * FROM talking_points WHERE application_id = $appId ORDER BY created_at DESC")
      .all({ $appId: applicationId });
  }
  if (company) {
    return db
      .query("SELECT * FROM talking_points WHERE company = $comp ORDER BY created_at DESC")
      .all({ $comp: company });
  }
  return db.query("SELECT * FROM talking_points ORDER BY created_at DESC").all();
}

export function insertTalkingPoint(tp: {
  id?: string;
  application_id?: string;
  company: string;
  category: string;
  headline: string;
  detail: string;
  source_url?: string;
  source_type?: string;
}) {
  const id = tp.id || `tp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  db.run(
    `INSERT OR REPLACE INTO talking_points (id, application_id, company, category, headline, detail, source_url, source_type, created_at)
     VALUES ($id, $application_id, $company, $category, $headline, $detail, $source_url, $source_type, CURRENT_TIMESTAMP)`,
    {
      $id: id,
      $application_id: tp.application_id || null,
      $company: tp.company,
      $category: tp.category,
      $headline: tp.headline,
      $detail: tp.detail,
      $source_url: tp.source_url || "",
      $source_type: tp.source_type || "MANUAL",
    }
  );
  return id;
}


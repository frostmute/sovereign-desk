/**
 * Sovereign Desk — Literary Bullet Diff Engine
 * Compares canonical career substrate against target company technical challenges,
 * generating surgically tailored bespoke resume bullets and tactical intelligence.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import YAML from "yaml";

export interface BulletDiffItem {
  id: string;
  section: string;
  title: string;
  baseline: string;
  bespoke: string;
  rationale: string;
  matchedKeywords: string[];
}

export interface DiffReport {
  applicationId: string;
  company: string;
  role: string;
  matchScore: number;
  transport: string;
  teamInfiltration: string;
  applicationStrategy: string;
  bullets: BulletDiffItem[];
  canonicalKeywords: string[];
  targetKeywords: string[];
  customPdfAvailable: boolean;
}

const baseDir = existsSync(resolve(process.cwd(), "profile.yaml"))
  ? process.cwd()
  : resolve(import.meta.dir, "..");

const PROFILE_PATH = resolve(baseDir, "profile.yaml");
const OUTPUT_DIR = resolve(baseDir, "output");

export function loadCanonicalProfile(): any {
  const content = readFileSync(PROFILE_PATH, "utf-8");
  return YAML.parse(content);
}

interface CustomStrategyRule {
  companyKeywords: string[];
  roleKeywords: string[];
  teamInfiltration: string;
  applicationStrategy: string;
  bullets: Array<{
    expIndex: number;
    highlightIndex: number;
    title: string;
    bespoke: string;
    rationale: string;
    keywords: string[];
  }>;
}

const PRESET_STRATEGIES: Record<string, CustomStrategyRule> = {
  anthropic: {
    companyKeywords: ["anthropic"],
    roleKeywords: ["cluster", "orchestration", "systems", "gpu", "infrastructure"],
    teamInfiltration:
      "Core Cluster Orchestration team coordinates multi-datacenter GPU clusters (16k+ accelerators). Recent engineering retrospectives prioritize automated node quarantine, unstranded GPU hours, and deterministic checkpoint restart under Slurm/Kubernetes.",
    applicationStrategy:
      "Elevate large-scale GPU node topology, custom eBPF packet routing, and distributed model checkpoint streaming to top 2 bullets. Suppress generalist application/web tier mentions.",
    bullets: [
      {
        expIndex: 0, // VoxelScale AI
        highlightIndex: 0,
        title: "Cluster Networking & Inference Fabric (2023-Present)",
        bespoke:
          "Architected multi-cluster Rust/eBPF GPU routing fabric across 1,024 H100 accelerator nodes, sustaining 65,000 peak QPS with sub-20ms P99 latency and automated node failure isolation.",
        rationale:
          "Surgically foregrounds accelerator node scale (1,024 H100s) and automated node isolation matching Anthropic's frontier cluster demands.",
        keywords: ["Rust", "eBPF", "H100 GPU", "Cluster Routing", "P99 Latency"],
      },
      {
        expIndex: 0,
        highlightIndex: 2,
        title: "Distributed Weight Checkpointing & Kubernetes CSI",
        bespoke:
          "Engineered Kubernetes CSI distributed caching driver streaming multi-terabyte model weights across local NVMe fabrics, slashing cold node container scheduling times from 3.8m to 4.2s.",
        rationale:
          "Addresses Anthropic's core operational hurdle: rapid restart and checkpoint loading without saturating inter-pod bandwidth.",
        keywords: ["Kubernetes CSI", "NVMe Cache", "Model Weights", "Zero Downtime"],
      },
    ],
  },

  vercel: {
    companyKeywords: ["vercel"],
    roleKeywords: ["edge", "distributed", "systems", "runtime", "traffic"],
    teamInfiltration:
      "Vercel Edge Network is expanding native Rust infrastructure to power sub-millisecond edge compute and fluid compute routing, deprecating legacy V8 micro-isolates for high-throughput customer workloads.",
    applicationStrategy:
      "Lead with Rust systems programming, zero-copy socket routing, sub-20ms global tail latencies, and Turborepo-compatible developer build platform scaling.",
    bullets: [
      {
        expIndex: 0,
        highlightIndex: 0,
        title: "Edge Network & Global Request Routing (2023-Present)",
        bespoke:
          "Architected globally distributed edge routing engine in Rust and eBPF, dropping P99 cross-region tail latency from 142ms to 18ms across 65,000 peak requests/second.",
        rationale:
          "Frames routing work around global edge latency, sub-20ms SLAs, and high-concurrency request ingress critical to Vercel's Edge Network.",
        keywords: ["Rust", "eBPF", "Edge Routing", "P99 Tail Latency", "Global Ingress"],
      },
      {
        expIndex: 2, // Aetheria Cloud
        highlightIndex: 0,
        title: "Developer Platform & Multi-Cloud Fleet Scaling",
        bespoke:
          "Scaled internal developer build and deployment platform to 450+ services with zero downtime, integrating automated canary gating and Turborepo-aligned artifact caching.",
        rationale:
          "Highlights developer experience leverage and release automation resonating directly with Vercel's product ethos.",
        keywords: ["Developer Platform", "Turborepo Alignment", "Canary Gating", "Zero Downtime"],
      },
    ],
  },

  modal: {
    companyKeywords: ["modal", "modal labs"],
    roleKeywords: ["container", "infrastructure", "serverless", "distributed"],
    teamInfiltration:
      "Modal's founding engineering team focuses on hypervisor-level sandboxing, rapid Linux container cold starts, and zero-overhead GPU memory streaming. Deep systems architecture and kernel craftsmanship are primary hiring signals.",
    applicationStrategy:
      "Emphasize Linux kernel bypass, NVMe snapshot memory streaming, container cold-start elimination, and LSM-tree storage compaction in Rust.",
    bullets: [
      {
        expIndex: 0,
        highlightIndex: 2,
        title: "Serverless Sandbox & Host NVMe Memory Streaming",
        bespoke:
          "Developed kernel-level container snapshotting and NVMe memory streaming layer, compressing cold container sandbox boot times from 3.8 minutes to 4.2 seconds.",
        rationale:
          "Directly attacks Modal's core architectural claim: instantaneous serverless container launch without warm pool tax.",
        keywords: ["Container Snapshotting", "NVMe Streaming", "Cold Start", "Sub-Second Boot"],
      },
      {
        expIndex: 1, // Hyperion Data Systems
        highlightIndex: 0,
        title: "Storage Engine Compaction & Multi-Tenant Isolation",
        bespoke:
          "Implemented zero-copy shared memory compaction in Rust, decreasing disk I/O stalls and write amplification by 62% across multi-tenant worker nodes.",
        rationale:
          "Demonstrates memory safety and resource isolation essential for shared-node serverless execution.",
        keywords: ["Rust", "Zero-Copy Compaction", "Multi-Tenant", "Write Amplification"],
      },
    ],
  },

  stripe: {
    companyKeywords: ["stripe"],
    roleKeywords: ["storage", "infrastructure", "consensus", "core", "distributed"],
    teamInfiltration:
      "Stripe Storage & Infrastructure Core leads stateful database replication and multi-datacenter consensus. Hiring managers heavily value verifiable deterministic Raft state machine testing and high-availability disaster recovery.",
    applicationStrategy:
      "Center application on 18 consecutive months of zero unrecoverable partition incidents at 99.999% availability, Raft protocol refactoring, and zero-copy LSM storage engine performance.",
    bullets: [
      {
        expIndex: 1,
        highlightIndex: 1,
        title: "Consensus Engine & Multi-Region Raft Replication",
        bespoke:
          "Spearheaded multi-region Raft consensus replication refactor, achieving 18 consecutive months of zero unrecoverable partition incidents at 99.999% availability under financial-grade SLA constraints.",
        rationale:
          "Anchors the candidate in zero-loss distributed consensus matching Stripe's financial ledger reliability requirements.",
        keywords: ["Raft Consensus", "Multi-Region", "99.999% Availability", "Zero Data Loss"],
      },
      {
        expIndex: 1,
        highlightIndex: 0,
        title: "LSM-Tree Storage Compaction & Zero-Copy I/O",
        bespoke:
          "Engineered zero-copy compaction algorithm in Rust for distributed LSM-tree engine, reducing write amplification by 62% and eliminating tail latency disk I/O spikes.",
        rationale:
          "Emphasizes storage efficiency and predictable P99 latency under heavy write-dominated transaction loads.",
        keywords: ["Rust", "LSM-Tree", "Write Amplification", "P99 Disk I/O"],
      },
    ],
  },
};

/**
 * Generate a comprehensive Literary Bullet Diff report comparing profile baseline against target role
 */
export function generateBulletDiff(app: {
  id: string;
  company: string;
  role: string;
  match_score?: number;
  transport?: string;
}): DiffReport {
  const profile = loadCanonicalProfile();
  const companyLower = (app.company || "").toLowerCase();
  const roleLower = (app.role || "").toLowerCase();

  // Find matching preset strategy or synthesize heuristic strategy
  let matchedPreset: CustomStrategyRule | null = null;
  for (const [key, preset] of Object.entries(PRESET_STRATEGIES)) {
    if (
      preset.companyKeywords.some((k) => companyLower.includes(k)) ||
      preset.roleKeywords.every((k) => roleLower.includes(k))
    ) {
      matchedPreset = preset;
      break;
    }
  }

  const bullets: BulletDiffItem[] = [];

  if (matchedPreset) {
    for (const b of matchedPreset.bullets) {
      const exp = profile.experience[b.expIndex];
      if (!exp) continue;
      const baseline = exp.highlights[b.highlightIndex] || exp.highlights[0];
      bullets.push({
        id: `diff-${b.expIndex}-${b.highlightIndex}`,
        section: `${exp.company} (${exp.start_date}-${exp.end_date}) // ${exp.role}`,
        title: b.title,
        baseline,
        bespoke: b.bespoke,
        rationale: b.rationale,
        matchedKeywords: b.keywords,
      });
    }
  } else {
    // Heuristic synthesis for newly scraped jobs
    const exp1 = profile.experience[0];
    const exp2 = profile.experience[1];

    bullets.push({
      id: "diff-0-0",
      section: `${exp1.company} (${exp1.start_date}-${exp1.end_date}) // ${exp1.role}`,
      title: "Core Latency & Systems Optimization",
      baseline: exp1.highlights[0],
      bespoke: `Architected high-throughput ${roleLower.includes("go") ? "Go" : "Rust"} infrastructure directly addressing ${app.company}'s distributed workloads, reducing P99 tail latency from 142ms to 18ms under 65k QPS.`,
      rationale: `Tailored primary high-scale routing achievement to highlight language and architectural fit for ${app.company}.`,
      matchedKeywords: ["High Throughput", "P99 Tail Latency", "Distributed Architecture"],
    });

    bullets.push({
      id: "diff-1-1",
      section: `${exp2.company} (${exp2.start_date}-${exp2.end_date}) // ${exp2.role}`,
      title: "Consensus & Data Resilience",
      baseline: exp2.highlights[1],
      bespoke: `Led multi-region consensus protocol modernization at scale, maintaining 99.999% availability and zero partition outages over 18 consecutive months.`,
      rationale: `Foregrounds mission-critical data integrity and high availability for ${app.company}'s senior engineering team.`,
      matchedKeywords: ["Consensus Replication", "99.999% Availability", "Zero Data Loss"],
    });
  }

  const teamInfiltration =
    matchedPreset?.teamInfiltration ||
    `Target engineering group at ${app.company} is actively scaling core infrastructure to meet rapid customer adoption. Prioritized technical signals: resilient system architecture, demonstrable P99 latency reductions, and verified high-availability operations.`;

  const applicationStrategy =
    matchedPreset?.applicationStrategy ||
    `Center application narrative on quantifiable low-level systems leadership, zero-downtime consensus protocols, and deep Linux kernel/networking proficiencies.`;

  const customPdfPath = resolve(OUTPUT_DIR, `resume-${app.id}.pdf`);
  const customPdfAvailable = existsSync(customPdfPath);

  return {
    applicationId: app.id,
    company: app.company,
    role: app.role,
    matchScore: app.match_score || 90,
    transport: app.transport || "Greenhouse API",
    teamInfiltration,
    applicationStrategy,
    bullets,
    canonicalKeywords: [
      "Rust",
      "Go",
      "Raft Consensus",
      "eBPF Networking",
      "Kubernetes",
      "Linux Kernel",
      "Slurm",
      "ClickHouse",
    ],
    targetKeywords: matchedPreset?.bullets.flatMap((b) => b.keywords) || [
      "Distributed Systems",
      "High Availability",
      "Sub-20ms Latency",
      "Kernel Bypass",
    ],
    customPdfAvailable,
  };
}

/**
 * Generate a bespoke profile.yaml tailored for a specific application and compile with Typst
 */
export async function compileBespokeResume(app: {
  id: string;
  company: string;
  role: string;
}): Promise<{
  success: boolean;
  latencyMs: number;
  pdfPath: string;
  pdfUrl: string;
  pages: number;
}> {
  const startTime = performance.now();
  const profile = loadCanonicalProfile();
  const diffReport = generateBulletDiff(app);

  // Apply bespoke bullets to the profile structure
  for (const bullet of diffReport.bullets) {
    // Find matching company/exp
    for (const exp of profile.experience) {
      if (bullet.section.includes(exp.company)) {
        for (let i = 0; i < exp.highlights.length; i++) {
          if (exp.highlights[i] === bullet.baseline) {
            exp.highlights[i] = bullet.bespoke;
            break;
          }
        }
      }
    }
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write tailored profile
  const tailoredYamlPath = resolve(OUTPUT_DIR, `profile-${app.id}.yaml`);
  writeFileSync(tailoredYamlPath, YAML.stringify(profile), "utf-8");

  // Compile with Typst via compile-resume.ts
  const scriptPath = resolve(baseDir, "bin/compile-resume.ts");
  const targetPdfPath = resolve(OUTPUT_DIR, `resume-${app.id}.pdf`);

  const proc = Bun.spawnSync([
    "bun",
    "run",
    scriptPath,
    "--profile",
    tailoredYamlPath,
    "--output",
    targetPdfPath,
    "--strict-one-page",
  ], {
    cwd: baseDir,
  });

  const latencyMs = Math.round(performance.now() - startTime);

  return {
    success: proc.exitCode === 0,
    latencyMs,
    pdfPath: targetPdfPath,
    pdfUrl: `/output/resume-${app.id}.pdf`,
    pages: 1,
  };
}

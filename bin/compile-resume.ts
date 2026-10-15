#!/usr/bin/env bun
/**
 * Sovereign Desk — Typst Resume Precision Compiler
 * Compiles canonical profile.yaml into mathematical 1-page Harvard-style resume PDF.
 */

import { existsSync, readFileSync, statSync, mkdirSync } from "fs";
import { resolve, dirname, relative } from "path";

interface CompileOptions {
  profilePath: string;
  templatePath: string;
  outputPath: string;
  format: "pdf" | "png" | "svg";
  strictOnePage: boolean;
  verbose: boolean;
}

function printUsage() {
  console.log(`
Sovereign Desk — Typst Resume Precision Compiler

Usage:
  bun run bin/compile-resume.ts [options]

Options:
  --profile <path>     Path to candidate profile YAML (default: ./profile.yaml)
  --template <path>    Path to Typst resume template (default: ./templates/resume.typ)
  --output <path>      Output artifact path (default: ./output/resume.pdf)
  --format <pdf|png>   Output format (default: pdf)
  --strict-one-page    Enforce strict 1-page limit with non-zero exit on overflow (default: true)
  --no-strict          Allow multi-page overflow
  --verbose, -v        Print detailed compiler diagnostics
  --help, -h           Show this help text
`);
}

function parseArgs(args: string[]): CompileOptions {
  const defaultRoot = existsSync(resolve(process.cwd(), "profile.yaml"))
    ? process.cwd()
    : resolve(import.meta.dir, "..");

  const options: CompileOptions = {
    profilePath: resolve(defaultRoot, "profile.yaml"),
    templatePath: resolve(defaultRoot, "templates/resume.typ"),
    outputPath: resolve(defaultRoot, "output/resume.pdf"),
    format: "pdf",
    strictOnePage: true,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else if (arg === "--profile" && args[i + 1]) {
      options.profilePath = resolve(process.cwd(), args[++i]);
    } else if (arg === "--template" && args[i + 1]) {
      options.templatePath = resolve(process.cwd(), args[++i]);
    } else if (arg === "--output" && args[i + 1]) {
      options.outputPath = resolve(process.cwd(), args[++i]);
    } else if (arg === "--format" && args[i + 1]) {
      const fmt = args[++i].toLowerCase();
      if (fmt === "pdf" || fmt === "png" || fmt === "svg") {
        options.format = fmt;
      } else {
        console.error(`[compiler] Invalid format '${fmt}'. Must be pdf, png, or svg.`);
        process.exit(1);
      }
    } else if (arg === "--strict-one-page") {
      options.strictOnePage = true;
    } else if (arg === "--no-strict") {
      options.strictOnePage = false;
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    }
  }

  return options;
}

function countPdfPages(pdfPath: string): number {
  try {
    const content = readFileSync(pdfPath, "binary");
    const matches = content.match(/\/Type\s*\/Page\b/g);
    return matches ? matches.length : 1;
  } catch {
    return 1;
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const startTime = performance.now();

  if (!existsSync(opts.profilePath)) {
    console.error(`[compiler] Profile file not found: ${opts.profilePath}`);
    process.exit(1);
  }

  if (!existsSync(opts.templatePath)) {
    console.error(`[compiler] Template file not found: ${opts.templatePath}`);
    process.exit(1);
  }

  const outDir = dirname(opts.outputPath);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // Find typst binary
  const typstProc = Bun.spawnSync(["which", "typst"]);
  const typstBin = typstProc.stdout.toString().trim() || "typst";

  // Compute profile path relative to project root
  const projectRoot = dirname(opts.profilePath);
  const relProfile = "/" + relative(projectRoot, opts.profilePath).replace(/^[/\\]+/, "");

  const typstArgs = [
    typstBin,
    "compile",
    "--root",
    projectRoot,
    opts.templatePath,
    opts.outputPath,
    "--input",
    `profile=${relProfile}`,
  ];

  if (opts.format === "png") {
    typstArgs.push("--ppi", "150");
  }

  if (opts.verbose) {
    console.log(`[compiler] Executing: ${typstArgs.join(" ")}`);
  }

  const result = Bun.spawnSync(typstArgs, {
    cwd: projectRoot,
    env: process.env,
  });

  const durationMs = Math.round(performance.now() - startTime);

  if (result.exitCode !== 0) {
    console.error(`[compiler] Typst compilation failed (exit code ${result.exitCode}):`);
    console.error(result.stderr.toString());
    process.exit(result.exitCode);
  }

  const stats = statSync(opts.outputPath);
  const sizeKb = (stats.size / 1024).toFixed(1);

  let pageCount = 1;
  if (opts.format === "pdf") {
    pageCount = countPdfPages(opts.outputPath);
  }

  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`  Sovereign Desk — Resume Precision Compiler`);
  console.log(`────────────────────────────────────────────────────────────`);
  console.log(`  Profile:       ${opts.profilePath}`);
  console.log(`  Template:      ${opts.templatePath}`);
  console.log(`  Artifact:      ${opts.outputPath} (${sizeKb} KB)`);
  console.log(`  Compilation:   ${durationMs} ms (Target < 1000 ms)`);
  console.log(`  Page Count:    ${pageCount} ${pageCount === 1 ? "[PASS — Perfect 1-Page]" : "[OVERFLOW]"}`);
  console.log(`────────────────────────────────────────────────────────────\n`);

  if (opts.strictOnePage && pageCount > 1) {
    console.error(`[compiler] Strict 1-page check failed: Resume generated ${pageCount} pages.`);
    console.error(`[compiler] Reduce text length, margins, or line leading to restore 1-page constraint.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[compiler] Unhandled error:", err);
  process.exit(1);
});

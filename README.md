# Sovereign Desk

Sovereign, air-gapped talent desk and autonomous remote job search assistant.

## Features

- **Sub-Second Typst Resume Compiler**: Compiles `profile.yaml` into an exact 1-page Harvard-style PDF resume in < 1,000ms with zero hallucination risk.
- **Editorial Executive Dashboard**: Classified intelligence dossier aesthetic on `http://localhost:3000` with literary bullet diffs and real-time status.
- **Sovereign SQLite Persistence**: Local SQLite database storing job postings, applications, contacts, and timeline events with zero cloud data leakage.
- **n8n Automation Engine**: Pre-built workflow definitions for scheduled scraping of Greenhouse and Ashby job boards.
- **1-Click Dispatch**: Human-in-the-loop application authorization with verifiable cryptographic receipts.

## Quick Start

```bash
cd sovereign-desk

# 1. Edit your career profile
vim profile.yaml

# 2. Compile your resume PDF
bun run compile

# 3. Start the Sovereign Desk web server
bun run start
# Open http://localhost:3000

# 4. (Optional) Run the full stack with n8n via Docker Compose
docker compose up -d
```

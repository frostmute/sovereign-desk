# Sovereign Desk — n8n Automation Workflows

This directory stores exportable workflow JSON files for the self-hosted n8n engine.

## Workflows

1. `greenhouse-board-scraper.json` (Milestone 2):
   - Polls target Greenhouse job boards via `https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true`.
   - Filters by remote policy, role titles, and minimum compensation criteria.
   - Forwards parsed opportunities to Sovereign Desk Server webhook (`POST http://desk:3000/api/webhooks/jobs`).

2. `ashby-board-scraper.json` (Milestone 2):
   - Polls Ashby public job boards via `https://api.ashbyhq.com/posting-api/job-board/{organization}`.
   - Filters and posts matches to Sovereign Desk Server.

3. `imap-inbox-watcher.json` (Milestone 4):
   - Monitors recruiter responses via IMAP with OAuth2 or App Passwords.
   - Parses message bodies, extracts action items and meeting invites, and updates the timeline.

4. `dispatch-executor.json` (Milestone 4):
   - Triggered by Sovereign Desk Server 1-click authorization button.
   - Dispatches multipart form data to Greenhouse, Ashby, or Lever with the compiled Typst PDF resume.

5. `target-repo-watcher.json` (Milestone 5):
   - Triggered on a 2-hour schedule to monitor target engineering team repositories (e.g., `vllm-project/vllm`, `modal-labs/modal-client`, `kubernetes-sigs/kueue`).
   - Polls recent GitHub commits and releases, filtering for kernel, scheduler, and memory-management commits.
   - Synthesizes tactical talking points mapped against the candidate's verified substrate achievements.
   - Dispatches intelligence via HTTP POST to `http://host.docker.internal:3000/api/webhooks/talking-points`.


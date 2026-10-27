# events-team-explorer

A showcase only: two static pages (the Agent Explorer and the Agent Lineup) published two ways from `src/`. No agent code, no data feed, nothing scheduled. See README.md for the URLs and the change steps.

- **Public repo, public site.** Never add real rep or customer names, phones, emails (only Alan's is allowed), rep-level sales or screenshots with real people in them. The one real-data screen is `docs/img/analyzer.jpg`: Rising Sun's team totals, already public on the event-analyzer site, and labeled real on both pages. Run `node build.js`, which refuses to write `docs/` unless `check-public.js` passes, and never hand-edit `docs/*.html`.
- **One source.** `src/explorer.html` is in artifact form (no doctype; the Artifact tool wraps it). The Lineup is generated from its `AGENTS` catalog by `src/build-lineup.js`. Change an agent in one place, build, push, then republish both Claude artifacts from `build/claude/`. Republishing the explorer must leave `capabilities` out, or Alan's saved plans (db) are dropped.
- **Saved plans** live only in the Claude copy's database (`data/users/me` on https://claude.ai/artifact/3UVCingGLjGF3amYnHuso1). The GitHub copy keeps picks in the visitor's browser, and "Email this plan to Alan" is how they reach him.
- Registered in `~/ai-system/REGISTRY.yaml` (projects.events-team-explorer, deployments, public_repo_audit). Change those entries if the URL or the repo's contents change.

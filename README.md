# Events Team Agent Explorer

The page Alan sends coordinators to see what the events team agents do, set them to their own rules, and build a division plan. It also includes the one-page Agent Lineup. Both pages live in two places, built from one source:

| Copy | Explorer | Lineup | Who it's for |
|---|---|---|---|
| GitHub Pages (public, not listed on Google) | https://allinalan.github.io/events-team-explorer/ | https://allinalan.github.io/events-team-explorer/lineup.html | anyone, no account needed |
| Claude artifacts (private until shared) | https://claude.ai/artifact/3UVCingGLjGF3amYnHuso1 | https://claude.ai/artifact/8MMufvYYEWhENMJ7ox6maA | Alan on his own calls |

**The application form**, https://allinalan.github.io/events-team-explorer/apply.html, is GitHub-only. Five short steps: the coordinator's team, where the hours go, what hurts, what they want, and what the admin costs them today from their own answers. It screens out anyone who isn't a coordinator running an events team in VectorConnect, then offers "Email my answers to Alan" (their mail app; it arrives only when they press Send), "Copy my answers", and "Pick a time" (Alan's Calendly discovery call, with a short summary in the booking's first question). It keeps answers in the visitor's browser only. Source: `src/apply.html`. The GitHub explorer and lineup link to it; the Claude copies don't.

## Where a plan is saved

- **GitHub copy:** in the visitor's own browser only. They can **Copy the plan**, or use **Email this plan to Alan**, which opens their mail app with the plan written out and addressed to ahernandez@allinknifeguy.com. The email button shows only outside Claude, because an artifact's sandboxed frame may not open a mail app.
- **Claude copy:** when Alan is signed in, each plan is saved privately in the artifact's database (`data/users/me`), where Claude can read it back to draft a proposal. Use this copy on calls.

## Build your own agent

Under the gallery, a coordinator can describe an agent that isn't on the list by answering four prompt words: **When** (what starts it), **Checks** (where it looks), **Does** (the job) and **Tells** (who hears about it). Tap-to-fill examples sit under three of the four. Each idea is saved with the plan (`plan.custom`: `name`, `when`, `checks`, `does`, `tells`). It shows as a card, in the summary under "Your own", and as four labeled lines in Copy the plan and the email, so Alan can scope it.

## The portal example

Under the "They ask" band, the explorer shows The Block as a coordinator sees it: `src/portal.html`, a click-through
example with a sample coordinator (Taylor Reese), sample reps and shows, and no phone numbers or e-mail addresses (phones
show only their last four digits). It has Today with "What your agents need", every agent's rules with Draft from your
policy and Notes for Claude ("This is right" before anything is used), the roster and the Freshmen page, Texts (labeled as
coming with the events line), Help and Settings. On a phone, like The Block since 2026-11-10, the bottom bar holds Today,
Agents, Roster, Texts and More, and More lists the rest (the sidebar still lists every page). Nothing in it is sent anywhere. `build.js` writes it as `portal.html` next to every copy
(`docs/portal.html`, `build/claude/portal.html`, and `<page>-portal.html` for a coordinator's copy), and the explorer
loads it with `<iframe src="portal.html">`, with Computer / Phone and Full screen; it posts `{blockDemo: 'ready'}` to the
page when it loads. Publish it with the page as the file `portal.html`. Never put it back into an iframe `srcdoc`:
claude.ai then refuses to share the page ("This version couldn't be reviewed for sharing", 2026-11-06). It was made 2026-11-06 from the proposal's example portal and brought up to The Block's main at 9521d2a.
When The Block changes in a way coordinators should see, change `src/portal.html` and rebuild.

## A coordinator's own copy

`node build.js --coordinator <their.json> --out <page.html>` also writes one coordinator's private claude.ai copy: their
name in the portal example (it replaces Taylor Reese), the agents from their call ticked (`PRESET`), a line from Alan under
the title, and the GitHub lineup link (the Claude lineup links back to Alan's private explorer). Their changes stay in their
own browser, and Copy the plan is how they reach Alan. The JSON and the page live in the private workspace, never in this
repo, because they carry the coordinator's name. Every other copy builds with `PRESET = null`.

## Changing an agent

1. Edit `src/explorer.html`. The `AGENTS` array is the catalog, and the Lineup is generated from it, so never edit the Lineup by hand. Layout changes to the Lineup go in `src/build-lineup.js`.
2. `node build.js` writes `docs/` (the GitHub copy) and `build/claude/` (the Claude copy). If the public check fails, `docs/` is left unchanged and the build exits 1.
3. Commit and push. Pages republishes `docs/` from `main` within a minute or two.
4. Republish the Claude copies with the Artifact tool: `build/claude/agent-explorer.html` to the explorer URL, with `files: {"portal.html": "build/claude/portal.html"}`, and `build/claude/agent-lineup.html` to the lineup URL. Leave `capabilities` out so the explorer keeps its saved plans.

The two pages link to each other. The source uses `{{LINEUP_URL}}` and `{{EXPLORER_URL}}`, and `build.js` fills them in for each copy, so a GitHub visitor never lands on a claude.ai sign-in screen.

## The public check (`check-public.js`)

This repo and its site are public. The build stops on any of these in `docs/`:
- a phone number
- an email address other than Alan's
- a claude.ai artifact link
- an unfilled placeholder
- a missing noindex tag
- a screenshot that isn't in `docs/img/`

Every name, customer and number on the pages is made up, with one exception: the Event Analyzer screen (`docs/img/analyzer.jpg`) shows Rising Sun's real team totals. It has no rep or customer names, the same numbers are already public on https://allinalan.github.io/event-analyzer, and both pages label it as real. Keep it that way: no real reps, customers, phones or rep-level sales in `src/` or `docs/img/`.

// Builds the lineup page: every agent on one page, from the explorer's own catalog.
// Usage: node src/build-lineup.js <catalog.json> <out.html>. The explorer link is left as {{EXPLORER_URL}}; build.js fills it per copy.
const fs = require('fs');
const [CATALOG, OUT] = process.argv.slice(2);
if (!CATALOG || !OUT) throw new Error('usage: build-lineup.js <catalog.json> <out.html>');
const { AREAS, SETS, STATUS, AGENTS, OWN_QS } = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const EXPLORER = '{{EXPLORER_URL}}';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const setChip = (s) => `<span class="set-chip s-${s}">${esc(SETS[s][0])}${s === 'addon' ? '' : ' set'}</span>`;
const stChip = (s) => `<span class="st ${STATUS[s][0]}">${esc(STATUS[s][1])}</span>`;
const count = (f) => AGENTS.filter(f).length;

const SCREENS_WIDE = [
  ['picking-order.jpg', 1200, 864, 'Picking Order Agent', 'Reps ranked tier by tier. Lowest points picks first.'],
  ['board.jpg', 1200, 759, 'Schedule Board', 'Every show, booth and shift, with booking status.'],
  ['etd.jpg', 1200, 759, 'Season Dashboard', 'Season totals against last year and a rep leaderboard.'],
  ['analyzer.jpg', 1200, 760, 'Event Analyzer', 'Which shows pay off, month by month.'],
  ['stat-audit.jpg', 1200, 864, 'Stat Reminder Agent', 'What every rep still owes before the meeting.'],
];
const SCREENS_PHONE = [
  ['sunny.jpg', 600, 1298, 'Rep Assistant', 'Customer lookups and shifts in seconds.'],
  ['rep.jpg', 600, 1000, 'A rep\'s own page', 'Rank, totals and a coaching read.'],
  ['stats-card.jpg', 600, 1298, 'Stat Assistant', 'Stats filed with the rep in a minute.'],
];
const HELPERS = [
  ['Meeting decks', 'Freshmen/JV meeting slides from my template and current policy.'],
  ['SimpleTexting list cleanup', 'Turns the call list into a file ready to upload.'],
  ['Shows on my calendar', 'Every show I\'m working, with the real hours and address.'],
  ['Mesa shift counts', 'Who worked Mesa Marketplace and how many shifts, for any month.'],
  ['RoR customer lists', 'Every rep\'s customer list, three times a year, in one Rep of Record sheet.'],
  ['VectorConnect exports', 'Events, event sales or team sales pulled into a spreadsheet.'],
];
const BEYOND = [
  ['My Cutco sales', 'ALMA', 'My assistant in Slack and on my phone. Sorts my email, books open sharpening slots, prepares service calls and text send-outs to past customers, builds logo mockups and quotes for business gifts, and pings my phone only when something is urgent.'],
  ['Weekly sales numbers', 'Sales autopilot', 'Every Tuesday it pulls my week from VectorConnect and my calendar and updates my command center. Once a month it builds my event profit and loss and a returns review.'],
  ['My coaching program', 'Sharp Ninja Academy agents', 'Check-in texts to mentees, onboarding and dashboard links, due-date reminders, a summary card after every group call, and a prep note after every one-on-one for the next call.'],
  ['Behind the scenes', 'Overseer and Workroom', 'A watchdog checks every agent every couple of minutes and fixes what it safely can. I build and fix agents by typing to Claude in Slack.'],
];

const agentCard = (a) => `
      <article class="agent">
        <div class="a-top"><h4>${esc(a.name)}${a.alias ? ` <span class="alias">${esc(a.alias)}</span>` : ''}</h4><div class="chips">${setChip(a.set)}${stChip(a.status)}</div></div>
        <p class="job">${esc(a.job)}</p>
        <p class="get"><b>You get</b> ${esc(a.result)}</p>
      </article>`;

const areas = AREAS.map(([k, label]) => {
  const list = AGENTS.filter((a) => a.area === k);
  if (!list.length) return '';
  return `
    <div class="area" id="area-${k}">
      <div class="area-head"><h3>${esc(label)}</h3><span class="mono">${list.length} agent${list.length > 1 ? 's' : ''}</span></div>
      <div class="agents">${list.map(agentCard).join('')}
      </div>
    </div>`;
}).join('');

const html = `<title>Agent Lineup</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: one scroll that reads like a lineup card. A strip of real screens up top, then every agent by area in a
   two-column list (same three lines each: job, what you get, set + status), then the portal, helpers, guard rails,
   and a short look past the events team. All In Automation navy and sunrise orange. */
:root {
  --bg: #F3F4F7;
  --surface: #FFFFFF;
  --ink: #16213A;
  --muted: #56627A;
  --line: #DCE0E8;
  --sun: #DD6B1A;
  --sun-ink: #B04F0B;
  --sun-soft: #FCEDE1;
  --frame: #1B2335;
  --shadow: 0 1px 2px rgba(17, 26, 44, 0.05), 0 8px 24px rgba(17, 26, 44, 0.08);
  --ok: #1F7139; --ok-bg: #E2F3E7;
  --wip: #8A5300; --wip-bg: #FBEFD7;
  --pilot: #5B3FA0; --pilot-bg: #ECE6F8;
  --navy: #111A2C; --navy-2: #1A2540; --navy-line: #2B3752; --navy-ink: #EEF1F6; --navy-muted: #AAB4C6; --gold: #F2B533;
  --mark-bg: #16213A; --mark-fg: #FFFFFF; --mark-accent: #F07A22;
  --f-display: "Big Shoulders Display", "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
  --f-body: "Source Sans 3", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --f-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0E1524; --surface: #162034; --ink: #E8ECF3; --muted: #A1ACBE; --line: #28334B;
    --sun: #FF9A47; --sun-ink: #FFB173; --sun-soft: #33231A; --frame: #0A0F1A;
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35);
    --ok: #7DD99D; --ok-bg: #173325; --wip: #F5C46A; --wip-bg: #3A2C12; --pilot: #C3A8F5; --pilot-bg: #2B2347;
    --navy: #0A101C; --navy-2: #141D30; --navy-line: #26324A; --navy-ink: #EEF1F6; --navy-muted: #A6B1C4; --gold: #F5BE45;
    --mark-bg: #24345A;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0E1524; --surface: #162034; --ink: #E8ECF3; --muted: #A1ACBE; --line: #28334B;
  --sun: #FF9A47; --sun-ink: #FFB173; --sun-soft: #33231A; --frame: #0A0F1A;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.35);
  --ok: #7DD99D; --ok-bg: #173325; --wip: #F5C46A; --wip-bg: #3A2C12; --pilot: #C3A8F5; --pilot-bg: #2B2347;
  --navy: #0A101C; --navy-2: #141D30; --navy-line: #26324A; --navy-ink: #EEF1F6; --navy-muted: #A6B1C4; --gold: #F5BE45;
  --mark-bg: #24345A;
  color-scheme: dark;
}
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font-family: var(--f-body); font-size: 17px; line-height: 1.55; -webkit-text-size-adjust: 100%; }
a { color: var(--sun-ink); text-underline-offset: 3px; }
:focus-visible { outline: 3px solid var(--sun); outline-offset: 2px; border-radius: 6px; }
img { max-width: 100%; }
.wrap { max-width: 1160px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--f-display); text-transform: uppercase; letter-spacing: 0.005em; line-height: 0.95; text-wrap: balance; margin: 0; font-weight: 800; }
h4 { margin: 0; font-size: 19px; line-height: 1.25; }
p { margin: 0; }
.mono { font-family: var(--f-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.eyebrow { font-family: var(--f-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: var(--sun-ink); }
.btn { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none; background: var(--sun); color: #FFFFFF; border: 1px solid var(--sun); }
.btn:hover { filter: brightness(0.95); }
.btn.ghost { background: transparent; color: var(--ink); border-color: var(--line); }
.st { display: inline-flex; align-items: center; gap: 6px; font-family: var(--f-mono); font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; line-height: 1.35; white-space: nowrap; }
.st::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.st.live { color: var(--ok); background: var(--ok-bg); }
.st.dev { color: var(--wip); background: var(--wip-bg); }
.st.pilot { color: var(--pilot); background: var(--pilot-bg); }
.set-chip { font-family: var(--f-mono); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); white-space: nowrap; }
.set-chip.s-basic { color: var(--ink); }
.set-chip.s-team { color: var(--sun-ink); border-color: color-mix(in srgb, var(--sun) 45%, var(--line)); }
.set-chip.s-complete { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.set-chip.s-addon { border-style: dashed; }

/* Header */
.top { padding-block: 22px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--f-display); font-weight: 800; text-transform: uppercase; font-size: 22px; letter-spacing: 0.02em; color: var(--ink); }
.brand svg { width: 32px; height: 32px; }
.brand b { color: var(--sun); }
.hero { padding-block: clamp(36px, 6vw, 64px) 0; }
.hero h1 { font-size: clamp(50px, 9vw, 104px); margin-top: 12px; }
.hero h1 em { font-style: normal; color: var(--sun); }
.lede { font-size: clamp(18px, 2.1vw, 21px); color: var(--muted); max-width: 62ch; margin-top: 18px; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 30px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.stats div { padding: 14px 16px 14px 0; display: grid; gap: 2px; min-width: 0; }
.stats div + div { padding-left: 16px; border-left: 1px solid var(--line); }
.stats b { font-family: var(--f-display); font-size: 44px; line-height: 1; font-weight: 800; font-variant-numeric: tabular-nums; }
.stats span { color: var(--muted); font-size: 14.5px; }
@media (max-width: 720px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .stats div:nth-child(3) { padding-left: 0; border-left: 0; } .stats div:nth-child(n+3) { border-top: 1px solid var(--line); } }

section { padding-block: clamp(48px, 7vw, 80px) 0; }
.sec-head { display: grid; gap: 10px; margin-bottom: 22px; max-width: 800px; }
.sec-head h2 { font-size: clamp(36px, 5.2vw, 54px); }
.sec-head p { color: var(--muted); }

/* Screens */
.shots { display: flex; flex-wrap: wrap; gap: 16px; }
.shot { flex: 1 1 320px; margin: 0; display: grid; gap: 8px; align-content: start; min-width: 0; }
.browser { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); box-shadow: var(--shadow); }
.browser .bar { height: 20px; display: flex; gap: 5px; align-items: center; padding: 0 9px; border-bottom: 1px solid var(--line); }
.browser .bar i { width: 7px; height: 7px; border-radius: 50%; background: var(--line); }
.browser img, .phone img { display: block; width: 100%; height: auto; }
.shot figcaption b { display: block; font-size: 16px; }
.shot figcaption span { color: var(--muted); font-size: 14.5px; }
.phones { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 22px; justify-content: center; }
.pshot { margin: 0; width: 200px; display: grid; gap: 8px; text-align: center; }
.phone { border: 6px solid var(--frame); border-radius: 28px; overflow: hidden; background: var(--frame); box-shadow: var(--shadow); }
.pshot figcaption b { display: block; font-size: 16px; }
.pshot figcaption span { color: var(--muted); font-size: 14.5px; }
.fine { color: var(--muted); font-size: 14px; margin-top: 14px; }

/* Agents */
.area { margin-top: 30px; }
.area:first-of-type { margin-top: 0; }
.area-head { display: flex; align-items: baseline; gap: 12px; border-bottom: 2px solid var(--ink); padding-bottom: 8px; margin-bottom: 14px; }
.area-head h3 { font-size: 28px; }
.agents { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.agents > .agent:last-child:nth-child(odd) { grid-column: 1 / -1; }
.agent { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: grid; grid-template-rows: auto auto 1fr; gap: 8px; min-width: 0; }
.a-top { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; justify-content: space-between; }
.a-top .chips { display: flex; gap: 6px; flex-wrap: wrap; }
.alias { font-family: var(--f-mono); font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); margin-left: 4px; }
.job { font-size: 16.5px; }
.get { font-size: 15.5px; color: var(--muted); align-self: end; border-top: 1px dashed var(--line); padding-top: 8px; }
.get b { color: var(--sun-ink); font-family: var(--f-mono); font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; margin-right: 6px; }
@media (max-width: 760px) { .agents { grid-template-columns: minmax(0, 1fr); } }

/* Build your own: the explorer's four prompt words, and a way into its form */
.own { border: 2px dashed color-mix(in srgb, var(--sun) 55%, var(--line)); border-radius: 18px; padding: clamp(18px, 3vw, 28px); background: var(--surface); display: grid; gap: 22px; }
.own-head { display: flex; flex-wrap: wrap; gap: 16px 24px; align-items: end; justify-content: space-between; }
.own-head h2 { font-size: clamp(34px, 4.6vw, 48px); margin-top: 8px; }
.own-head p { color: var(--muted); max-width: 60ch; margin-top: 10px; }
.own-words { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.own-words div { border-top: 3px solid var(--sun); padding-top: 10px; display: grid; gap: 4px; align-content: start; min-width: 0; }
.own-words b { font-family: var(--f-display); text-transform: uppercase; font-weight: 800; font-size: 38px; line-height: 0.95; color: var(--sun-ink); }
.own-words span { font-weight: 700; font-size: 15.5px; }
.own-words i { color: var(--muted); font-size: 14.5px; }
@media (max-width: 760px) { .own-words { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

/* Portal + helpers */
.pair { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 20px; display: grid; gap: 10px; align-content: start; min-width: 0; }
.panel h3 { font-size: 26px; }
.panel p { color: var(--muted); font-size: 16px; }
.panel ul { margin: 0; padding-left: 18px; display: grid; gap: 6px; font-size: 15.5px; }
.helpers { list-style: none; padding: 0 !important; display: grid; gap: 0 !important; }
.helpers li { display: grid; gap: 2px; padding: 9px 0; border-top: 1px solid var(--line); }
.helpers li:first-child { border-top: 0; padding-top: 0; }
.helpers li span { color: var(--muted); font-size: 15px; }
@media (max-width: 760px) { .pair { grid-template-columns: minmax(0, 1fr); } }

/* Navy band */
.band { background: var(--navy); color: var(--navy-ink); margin-top: clamp(48px, 7vw, 80px); padding-block: clamp(44px, 6vw, 68px); }
.band .eyebrow { color: var(--gold); }
.band h2 { font-size: clamp(34px, 5vw, 52px); color: var(--navy-ink); margin-top: 8px; }
.rules { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
.rule { border-top: 2px solid var(--gold); padding-top: 12px; min-width: 0; }
.rule b { display: block; font-size: 16.5px; }
.rule span { color: var(--navy-muted); font-size: 15px; }
.beyond { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
.bcard { background: var(--navy-2); border: 1px solid var(--navy-line); border-radius: 14px; padding: 18px; display: grid; gap: 6px; align-content: start; min-width: 0; }
.bcard .mono { color: var(--gold); }
.bcard h4 { color: var(--navy-ink); font-size: 19px; }
.bcard p { color: var(--navy-muted); font-size: 15.5px; }
.band-gap { height: clamp(40px, 6vw, 60px); }
@media (max-width: 860px) { .rules { grid-template-columns: repeat(2, minmax(0, 1fr)); } .beyond { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 520px) { .rules { grid-template-columns: minmax(0, 1fr); } }

.cta { padding-block: clamp(44px, 6vw, 72px); display: grid; gap: 16px; justify-items: start; }
.cta p.big { font-family: var(--f-display); text-transform: uppercase; font-weight: 800; font-size: clamp(32px, 4.8vw, 50px); line-height: 1; max-width: 20ch; text-wrap: balance; }
.cta p.big em { font-style: normal; color: var(--sun); }
.cta .sign { color: var(--muted); font-size: 15px; }
</style>

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="aia-mark" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="15" style="fill:var(--mark-bg)"/>
    <path d="M16 50 L32 13 L48 50" fill="none" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--mark-fg)"/>
    <path d="M21.6 37 H42.4" fill="none" stroke-width="4.5" stroke-linecap="round" style="stroke:var(--mark-accent)"/>
    <circle cx="21.6" cy="37" r="5.6" style="fill:var(--mark-accent)"/>
    <circle cx="42.4" cy="37" r="5.6" style="fill:var(--mark-accent)"/>
  </symbol>
</svg>

<header class="wrap top">
  <span class="brand"><svg aria-hidden="true"><use href="#aia-mark"/></svg>All In <b>Automation</b></span>
  <a class="btn ghost" href="${EXPLORER}">Open the agent explorer</a>
</header>

<main>
  <div class="wrap hero">
    <p class="eyebrow">Alan Hernandez · proven at Rising Sun</p>
    <h1>What I've built <em>so far</em></h1>
    <p class="lede">Every agent I run for the Rising Sun events team, on one page. Each one took over a piece of coordinator work I used to do by hand, and each one can be set to another division's rules.</p>
    <div class="stats">
      <div><b>${AGENTS.length}</b><span>events-team agents</span></div>
      <div><b>${count((a) => a.status === 'live')}</b><span>live at Rising Sun today</span></div>
      <div><b>${HELPERS.length}</b><span>smaller helpers I run on request</span></div>
      <div><b>1</b><span>portal where coordinators see it all</span></div>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="sec-head"><p class="eyebrow">What it looks like</p><h2>The screens reps and leaders use</h2></div>
      <div class="shots">${SCREENS_WIDE.map(([f, w, h, t, c]) => `
        <figure class="shot"><div class="browser"><div class="bar"><i></i><i></i><i></i></div><img src="img/${f}" width="${w}" height="${h}" alt="${esc(t)}: ${esc(c)}" loading="lazy"></div><figcaption><b>${esc(t)}</b><span>${esc(c)}</span></figcaption></figure>`).join('')}
      </div>
      <div class="phones">${SCREENS_PHONE.map(([f, w, h, t, c]) => `
        <figure class="pshot"><div class="phone"><img src="img/${f}" width="${w}" height="${h}" alt="${esc(t)}: ${esc(c)}" loading="lazy"></div><figcaption><b>${esc(t)}</b><span>${esc(c)}</span></figcaption></figure>`).join('')}
      </div>
      <p class="fine">Names and customers in these screens are made up. The Event Analyzer shows Rising Sun's real team totals.</p>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="sec-head"><p class="eyebrow">The lineup</p><h2>Every agent, by the job it does</h2><p>Basic, Team and Complete are the sets a division can start with. Add-ons go on any set.</p></div>
      ${areas}
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="own">
        <div class="own-head">
          <div>
            <p class="eyebrow">Don't see it?</p>
            <h2>Build your own agent</h2>
            <p>Answer four words in the explorer and it goes in your plan. I read every one and come back with what it would take.</p>
          </div>
          <a class="btn" href="${EXPLORER}#own">Build yours in the explorer</a>
        </div>
        <div class="own-words">${OWN_QS.map((q) => `<div><b>${esc(q.word)}</b><span>${esc(q.ask)}</span><i>${esc(q.ph.replace(/^Like: /, 'Like '))}</i></div>`).join('')}</div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap pair">
      <div class="panel">
        <span class="mono">For the coordinator</span>
        <h3>The Block, your portal</h3>
        <p>Where a coordinator signs in to see every agent and what it's working on, open their dashboards and ask for help. Approvals and texts move in here next.</p>
        <ul><li>Your team roster: every rep and tier in one place, and the agents read it from there</li><li>A ping on your phone when an agent is stuck or waiting on you</li><li>One settings file per division: time zone, Vector week, texting hours, who approves</li><li>Each agent's rules set from a form, or drafted from your policy doc</li><li>An events line in your name for texts to reps</li></ul>
      </div>
      <div class="panel">
        <span class="mono">On request</span>
        <h3>Smaller helpers</h3>
        <ul class="helpers">${HELPERS.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <div class="band">
    <div class="wrap">
      <p class="eyebrow">How they're run</p>
      <h2>They ask before they act</h2>
      <div class="rules">
        <div class="rule"><b>Nothing new goes out without a yes</b><span>The first time an agent sends something, you see every recipient and every word.</span></div>
        <div class="rule"><b>When in doubt, it stops</b><span>If a number doesn't tie out or a page won't load, it sends nothing and says why.</span></div>
        <div class="rule"><b>Every agent has its own off switch</b><span>Pausing one never touches the others.</span></div>
        <div class="rule"><b>It proves it worked</b><span>Forms, emails and texts are read back before an agent calls it done.</span></div>
      </div>
      <div class="band-gap"></div>
      <p class="eyebrow">Beyond the events team</p>
      <h2>Same playbook, my other businesses</h2>
      <div class="beyond">${BEYOND.map(([k, t, d]) => `
        <div class="bcard"><span class="mono">${esc(k)}</span><h4>${esc(t)}</h4><p>${esc(d)}</p></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="wrap cta">
    <p class="big">Want these for <em>your division?</em></p>
    <a class="btn" href="${EXPLORER}">Open the agent explorer</a>
    <p class="sign">Alan Hernandez · All In Automation · Rising Sun Events Team</p>
  </div>
</main>
`;
fs.writeFileSync(OUT, html);

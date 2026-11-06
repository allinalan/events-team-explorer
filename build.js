// Builds every copy of the two pages from src/:
//   docs/index.html, docs/lineup.html   the GitHub Pages copy (public, noindex, works with no Claude account)
//   docs/apply.html                     the application form (GitHub copy only), from src/apply.html
//   build/claude/*.html                 the Claude artifact copy (published by hand with the Artifact tool)
// The explorer carries the example portal (src/portal.html) in a frame, in every copy.
// Usage: node build.js. Nothing is written to docs/ unless the public check passes.
//        node build.js --coordinator <their.json> --out <page.html> also writes one coordinator's own claude.ai copy
//        (their name in the portal, their picks ticked). That file and that page live in the private workspace only.
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const { checkPublic } = require('./check-public');

const ROOT = __dirname;
const SITE = 'https://allinalan.github.io/events-team-explorer/';
const CLAUDE_EXPLORER = 'https://claude.ai/artifact/3UVCingGLjGF3amYnHuso1';
const CLAUDE_LINEUP = 'https://claude.ai/artifact/8MMufvYYEWhENMJ7ox6maA';
const BUILD = path.join(ROOT, 'build');

// 1. The lineup is generated from the explorer's own catalog, so the two pages never disagree about an agent.
const explorer = fs.readFileSync(path.join(ROOT, 'src/explorer.html'), 'utf8');
const a = explorer.indexOf('const AREAS = ['), b = explorer.indexOf('const byId = ');
if (a < 0 || b < 0) throw new Error('catalog not found in src/explorer.html (AREAS ... byId moved?)');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(explorer.slice(a, b).replace(/^const /gm, 'var '), ctx);
fs.mkdirSync(path.join(BUILD, 'claude'), { recursive: true });
const catalogPath = path.join(BUILD, 'catalog.json');
if (!Array.isArray(ctx.OWN_QS) || ctx.OWN_QS.length !== 4) throw new Error('OWN_QS (the four build-your-own words) not found in the catalog');
fs.writeFileSync(catalogPath, JSON.stringify({ AREAS: ctx.AREAS, SETS: ctx.SETS, STATUS: ctx.STATUS, AGENTS: ctx.AGENTS, OWN_QS: ctx.OWN_QS }, null, 1));
const lineupSrcPath = path.join(BUILD, 'lineup.src.html');
execFileSync(process.execPath, [path.join(ROOT, 'src/build-lineup.js'), catalogPath, lineupSrcPath], { stdio: 'inherit' });
const lineup = fs.readFileSync(lineupSrcPath, 'utf8');

// The example portal is its own file, portal.html, next to every copy of the explorer (iframe src="portal.html").
// Not an iframe srcdoc: claude.ai refuses to share a page that carries a whole document in srcdoc ("This version couldn't
// be reviewed for sharing", 2026-11-06; the same page shared fine once the portal was its own file).
const portal = fs.readFileSync(path.join(ROOT, 'src/portal.html'), 'utf8');
if (/\{\{[A-Z_]+\}\}/.test(portal)) throw new Error('src/portal.html has a {{PLACEHOLDER}}; it is filled as a whole, never by key');
const portalDoc = (html, noindex) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  (noindex ? '<meta name="robots" content="noindex, nofollow">' : '') + '</head><body>' + html + '</body></html>';
if (!/<iframe id="pd-frame"[^>]* src="portal\.html"/.test(explorer)) throw new Error('src/explorer.html: the portal frame must load src="portal.html"');

const fill = (html, links) => {
  let out = html;
  for (const [k, v] of Object.entries(links)) out = out.split(`{{${k}}}`).join(v);
  const left = out.match(/\{\{[A-Z_]+\}\}/);
  if (left) throw new Error('unfilled placeholder ' + left[0]);
  return out;
};

// 2. Claude copy: the artifact form (no doctype; the Artifact tool wraps it), linking to the other artifact. The
// application form is public-only (Alan uses the Claude explorer on his own calls), so the Claude copies carry no link to it.
const claudeLinks = { LINEUP_URL: CLAUDE_LINEUP, EXPLORER_URL: CLAUDE_EXPLORER, APPLY_LINK: '', APPLY_BTN: '', PRESET: 'null' };
fs.writeFileSync(path.join(BUILD, 'claude/agent-explorer.html'), fill(explorer, claudeLinks));
fs.writeFileSync(path.join(BUILD, 'claude/portal.html'), portalDoc(portal));   // published as the explorer's file portal.html
fs.writeFileSync(path.join(BUILD, 'claude/agent-lineup.html'), fill(lineup, claudeLinks));

// 3. GitHub copy: a full document with the same reset the Artifact tool adds, so it renders the same,
// plus noindex and a link preview for texts.
const RESET = ':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';
const ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#16213A"/><path d="M14 44a18 18 0 0 1 36 0z" fill="#DD6B1A"/><rect x="10" y="46" width="44" height="4" rx="2" fill="#EEF1F6"/></svg>');
function pagesDoc(html, { description, file }) {
  // The source starts with <title>, a Claude-only meta and the font links; they move into <head>.
  const start = html.indexOf('<style>');
  if (start < 0) throw new Error(file + ': no <style> block');
  const lead = html.slice(0, start).split('\n').filter((l) => l.trim() && !l.includes('name="claude:'));
  const title = (lead.join('\n').match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) throw new Error(file + ': no <title>');
  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    '<meta name="robots" content="noindex, nofollow">',
    `<meta name="description" content="${description}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${SITE}img/board.jpg">`,
    `<meta property="og:url" content="${SITE}${file === 'index.html' ? '' : file}">`,
    `<link rel="icon" href="${ICON}">`,
    `<style>${RESET}</style>`,
    ...lead,
  ].join('\n');
  return `<!doctype html>\n<html lang="en">\n<head>\n${head}\n</head>\n<body>\n${html.slice(start)}\n</body>\n</html>\n`;
}
const pagesLinks = {
  LINEUP_URL: 'lineup.html', EXPLORER_URL: './',
  APPLY_LINK: '<a href="apply.html">See if it fits your team</a>',
  APPLY_BTN: '<a class="btn ghost" href="apply.html">See if it fits your team</a>',
  PRESET: 'null',
};
const apply = fs.readFileSync(path.join(ROOT, 'src/apply.html'), 'utf8');
const pages = {
  'index.html': pagesDoc(fill(explorer, pagesLinks), { file: 'index.html', description: 'Open each events team agent, watch it run, set it to your rules, and build your division plan.' }),
  'lineup.html': pagesDoc(fill(lineup, pagesLinks), { file: 'lineup.html', description: 'Every events team agent on one page: what it does, what you get, and which set it comes in.' }),
  'apply.html': pagesDoc(fill(apply, pagesLinks), { file: 'apply.html', description: 'Five short steps: see what the admin costs your events team today, then pick a time with Alan.' }),
  'portal.html': portalDoc(portal, true),
};

// 4. Fail closed: check the GitHub copy before it replaces what is in docs/.
const problems = checkPublic(pages, path.join(ROOT, 'docs'));
if (problems.length) {
  console.error('NOT WRITTEN: the public check failed. docs/ is unchanged.\n- ' + problems.join('\n- '));
  process.exit(1);
}
for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(ROOT, 'docs', f), html);
console.log('docs/:', Object.keys(pages).map((f) => `${f} ${pages[f].length} bytes`).join(', '));
console.log('build/claude/: agent-explorer.html, agent-lineup.html, portal.html');
console.log('agents', ctx.AGENTS.length, 'live', ctx.AGENTS.filter((x) => x.status === 'live').length);

// 5. One coordinator's own claude.ai copy: their name in the example portal, the agents from their call ticked, and a
// line from Alan. Its lineup link is the GitHub one, because the Claude lineup links back to Alan's private explorer.
const argv = process.argv.slice(2), flag = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null; };
const coordFile = flag('--coordinator');
if (coordFile) {
  const out = flag('--out');
  if (!out) throw new Error('--coordinator needs --out <page.html>');
  const c = JSON.parse(fs.readFileSync(coordFile, 'utf8'));
  for (const k of ['title', 'name', 'first', 'preset']) if (!c[k]) throw new Error(`${coordFile}: "${k}" is missing`);
  const unknown = (c.preset.agents || []).filter((id) => !ctx.AGENTS.some((x) => x.id === id));
  if (unknown.length) throw new Error(`${coordFile}: no agent called ${unknown.join(', ')}`);
  const last = c.name.trim().split(/\s+/).pop();
  const vcUser = (c.first[0] + last).toLowerCase().replace(/[^a-z]/g, '');
  const theirs = [['Taylor Reese', c.name], ['treese', vcUser], ['Taylor', c.first]].reduce((h, [a, b]) => h.split(a).join(b), portal);
  if (/Taylor|treese/.test(theirs)) throw new Error('the sample coordinator is still in their portal');
  const title = '<title>Events Team Agent Explorer</title>';
  if (!explorer.includes(title)) throw new Error('src/explorer.html: ' + title + ' not found');
  const own = fill(explorer.replace(title, `<title>${c.title.replace(/[<>&]/g, '')}</title>`), {
    LINEUP_URL: SITE + 'lineup.html', EXPLORER_URL: SITE, APPLY_LINK: '', APPLY_BTN: '',
    PRESET: JSON.stringify(c.preset).replace(/</g, '\\u003c'),
  });
  const portalOut = out.replace(/\.html$/, '') + '-portal.html';   // publish it as the page's file portal.html
  fs.writeFileSync(out, own);
  fs.writeFileSync(portalOut, portalDoc(theirs));
  console.log(`${out}: ${own.length} bytes, ${c.preset.agents.length} agents ticked for ${c.name}; portal: ${portalOut}`);
}

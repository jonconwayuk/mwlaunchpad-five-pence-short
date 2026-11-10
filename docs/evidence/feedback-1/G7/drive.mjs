// G7: drives /team (Manager and Buddy view) in headless Chrome over the DevTools protocol (no extra dependency).
// Usage: node docs/evidence/feedback-1/G7/drive.mjs http://localhost:3107 (freshly seeded db)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const base = process.argv[2];
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--remote-debugging-port=9347', '--user-data-dir=/tmp/g7-chrome', '--window-size=1280,900', 'about:blank',
], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1500);
const target = await (await fetch('http://localhost:9347/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); pending.get(m.id)?.(m.result); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const out = [];
const check = (name, ok, detail) => out.push(`${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
const open = async (path, width) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 640 });
  await send('Page.navigate', { url: base + path });
  await wait(5000);
};
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: await js('innerWidth'), height: Math.min(await js('document.documentElement.scrollHeight'), 2600), scale: 1 } });
  writeFileSync(new URL(`./${name}.png`, import.meta.url), Buffer.from(data, 'base64'));
};
const text = () => js('document.querySelector("main").innerText');
const noSideScroll = async (label) => {
  const [sw, iw] = await js('[document.documentElement.scrollWidth, innerWidth]');
  check(`no horizontal scroll ${label}`, sw <= iw, `scrollWidth ${sw}, innerWidth ${iw}`);
};
const click = (selText, tag = 'button') => js(`(() => { const b = [...document.querySelectorAll('${tag}')].find((n) => n.offsetParent && n.textContent.trim() === ${JSON.stringify(selText)}); b?.click(); return !!b; })()`);
const setValue = (sel, value) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)});
  const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return el.value; })()`);

await send('Page.enable');

// 1. At reset Bob has no Pathway: a friendly line, not an error.
for (const w of [390, 1280]) {
  await open('/team?viewer=lm-hannah', w);
  const t = await text();
  check(`no plan yet at ${w}`, t.includes('No plan yet — HR will apply one') && !/error/i.test(t), JSON.stringify(t.slice(0, 200)));
  await noSideScroll(`no plan ${w}`);
  await shot(`1-hannah-no-plan-${w}`);
}

// 2. HR applies pw-infra-e, then the clock moves 21 days.
check('apply pw-infra-e to Bob', (await post('/api/apply', { pathwayId: 'pw-infra-e', personId: 'person-bob' })).ok, 'POST /api/apply');
check('clock +21 days', (await post('/api/clock', { advanceDays: 21 })).ok, 'POST /api/clock');

for (const w of [390, 1280]) {
  await open('/team?viewer=lm-hannah', w);
  const t = await text();
  const line = t.split('\n').find((l) => l.startsWith('Bob is in')) ?? '';
  check(`friendly progress at ${w}`, /Bob is in .+\. \d+ of \d+ things done\./.test(line), JSON.stringify(line));
  await noSideScroll(`Hannah ${w}`);
  await shot(`2-hannah-bob-progress-${w}`);
}
const layout = await js(`(() => { const [a, b] = document.querySelector('main > div > div').parentElement.children; const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect(); return { list: Math.round(r1.width), detail: Math.round(r2.width), sideBySide: r2.left >= r1.right }; })()`);
check('desktop: list beside the selected starter at 1280', layout.sideBySide, JSON.stringify(layout));

// 3. Hannah adds the Modern Workplace team access package, unlocking Now.
await click('Add a journey');
await wait(300);
const opt = await js(`[...document.querySelectorAll('option')].find((o) => o.textContent.startsWith('Modern Workplace team access package'))?.value ?? ''`);
await setValue('main select:not(:first-child)', ''); // no-op; keeps the tag filter on All journeys
await js(`(() => { const s = [...document.querySelectorAll('select')].find((x) => [...x.options].some((o) => o.value === ${JSON.stringify(opt)})); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, ${JSON.stringify(opt)}); s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await wait(200);
await click('Confirm');
await wait(3500);
const added = (await text()).includes('Modern Workplace team access package');
check('Add a journey: Modern Workplace team access package', added && opt === 'j-mw-access', `option ${opt}, on page ${added}`);
await shot('3-hannah-added-access-package-1280');

// 4. Send a Reminder now, with the company car quick choice.
await click('Have a look at the company car scheme');
await wait(200);
await click('Send a Reminder now');
await wait(1500);
const status = await js(`[...document.querySelectorAll('fieldset [role=status]')].map((n) => n.textContent).join(' ')`);
check('Send a Reminder now', status.startsWith('Reminder sent'), `status ${JSON.stringify(status)} (if this names a 404, /api/reminders from G3 is not merged yet)`);
await shot('4-hannah-reminder-1280');

// 5. Buddy: Stage, Containers, own Tasks, note box only.
for (const w of [390, 1280]) {
  await open('/team?viewer=buddy-leo', w);
  const t = await text();
  const leaks = ['Blocked Flag', 'Waiting on', 'asked for help', 'Needs decision', 'things done', 'Send a Reminder now', 'Add a journey', 'Added by'].filter((x) => t.includes(x));
  check(`buddy sees no check detail at ${w}`, leaks.length === 0 && t.includes('Bob is in') && t.includes('Note to Bob Warwick'), `leaks ${JSON.stringify(leaks)}`);
  await noSideScroll(`Leo ${w}`);
  await shot(`5-leo-buddy-${w}`);
}

// 6. Persona B's Line Manager still works (section 9 item 4 path).
await open('/team?viewer=lm-chris', 390);
const chris = await text();
check('lm-chris view loads', chris.includes('Your starters') && chris.includes('Add a journey'), JSON.stringify(chris.slice(0, 160)));
await noSideScroll('Chris 390');
await shot('6-chris-390');

// 7. The top strip's phone frame on a wide window shows the phone layout (container queries).
await send('Network.setCookie', { name: 'layout', value: 'phone', url: base });
await open('/team?viewer=lm-hannah', 1280);
const phoneList = await js(`getComputedStyle(document.querySelector('main ul')).display`);
check('phone frame at 1280 uses the phone layout', phoneList === 'none', `desktop starter list display: ${phoneList}`);
await shot('7-hannah-phone-frame-1280');

writeFileSync(new URL('./drive.txt', import.meta.url), out.join('\n') + '\n');
console.log(out.join('\n'));
ws.close();
chrome.kill();

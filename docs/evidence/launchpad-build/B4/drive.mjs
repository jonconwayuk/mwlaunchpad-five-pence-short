// Drives the B4 canvas in headless Chrome over the DevTools protocol (no extra dependency).
// Usage: node docs/evidence/launchpad-build/B4/drive.mjs http://localhost:3014/portal/pathways/branch-colleague
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const url = process.argv[2];
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--remote-debugging-port=9333', '--user-data-dir=/tmp/b4-chrome', '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1500);
const target = await (await fetch(`http://localhost:9333/json/new?${url}`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); pending.get(m.id)?.(m.result); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;
const centre = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
const mouse = async (from, to) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...from });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...from });
  for (let i = 1; i <= 10; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1,
      x: from.x + ((to.x - from.x) * i) / 10, y: from.y + ((to.y - from.y) * i) / 10 });
    await wait(30);
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...to });
  await wait(300);
};
const node = (id) => `.react-flow__node[data-id="${id}"]`;
const posX = (id) => js(`new DOMMatrix(getComputedStyle(document.querySelector('${node(id)}')).transform).m41`);
const out = [];
const check = (name, ok, detail) => out.push(`${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`);

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await wait(6000);

// 1. Drag a Journey from the library onto the Pre-contract lane: it snaps into its own Onboarding lane.
const drop = await centre(node('i-contracting'));
await js(`(() => {
  const dt = new DataTransfer(); dt.setData('application/x-launchpad-journey', 'j-branch-induction');
  const pane = document.querySelector('.react-flow').parentElement;
  for (const type of ['dragover', 'drop']) pane.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: ${drop.x}, clientY: ${drop.y + 200} }));
})()`);
await wait(500);
const dropped = await js(`!!document.querySelector('${node('i-j-branch-induction-1')}')`);
const droppedX = dropped ? await posX('i-j-branch-induction-1') : NaN;
check('drag from library into its lane', dropped && droppedX >= 560 && droppedX < 840, `dropped over Pre-contract, card x=${droppedX} (Onboarding lane is 560 to 840)`);

// 2. Drag a card sideways into another lane: it stays in its own lane.
const payroll = await centre(node('i-payroll'));
await mouse(payroll, { x: payroll.x + 400, y: payroll.y });
const px = await posX('i-payroll');
check('card cannot leave its Stage lane', px >= 280 && px < 560, `dragged 400px right, card x=${px} (Pre-employment lane is 280 to 560)`);

// 3. A Dependency that would loop is refused with a named message.
await mouse(await centre(`${node('i-payroll')} .react-flow__handle.source`), await centre(`${node('i-contracting')} .react-flow__handle.target`));
const alert = await js(`document.querySelector('[role=alert]')?.textContent ?? ''`);
check('loop refused with named message', alert.includes('Payroll already waits for Contracting, so Contracting cannot wait for Payroll.'), JSON.stringify(alert));

// 4. A Dependency connects.
const before = await js(`document.querySelectorAll('.react-flow__edge').length`);
await mouse(await centre(`${node('i-payroll')} .react-flow__handle.source`), await centre(`${node('i-uniform')} .react-flow__handle.target`));
const after = await js(`document.querySelectorAll('.react-flow__edge').length`);
check('Dependency connects', after === before + 1, `edges ${before} -> ${after}`);

// 5. Mandatory toggles and shows a padlock.
const lockBefore = await js(`!!document.querySelector('${node('i-uniform')} [aria-label=Mandatory]')`);
const uniform = await centre(node('i-uniform'));
await mouse(uniform, uniform);
await js(`document.querySelector('[role=switch]').click()`);
await wait(300);
const lockAfter = await js(`!!document.querySelector('${node('i-uniform')} [aria-label=Mandatory]')`);
check('Mandatory toggles and shows a padlock', !lockBefore && lockAfter, `padlock on Uniform ${lockBefore} -> ${lockAfter}`);

// 6. The fixture's Container, Timer and Hard Stop render.
const blocks = await js(`[...document.querySelectorAll('.react-flow__node-container, .react-flow__node-timer, .react-flow__node-hardStop')].map((n) => n.textContent)`);
check('Container, Timer and Hard Stop render', blocks.some((t) => t.includes('Cleared to start')) && blocks.some((t) => t.includes('7 days before start date')) && blocks.some((t) => t.includes('Pre-employment checks failed')), JSON.stringify(blocks));

const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(new URL('./after-drive.png', import.meta.url), Buffer.from(shot.data, 'base64'));
writeFileSync(new URL('./drive-result.txt', import.meta.url), out.join('\n') + '\n');
process.stdout.write(out.join('\n') + '\n');
ws.close();
chrome.kill();

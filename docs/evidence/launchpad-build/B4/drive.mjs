// Drives the B4 canvas in headless Chrome over the DevTools protocol (no extra dependency).
// Usage: node docs/evidence/launchpad-build/B4/drive.mjs http://localhost:3034/portal/pathways/branch-colleague
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const url = process.argv[2];
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--remote-debugging-port=9333', '--user-data-dir=/tmp/b4-chrome', '--window-size=1280,800', 'about:blank',
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
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await wait(6000);

const first = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(new URL('./canvas-1280.png', import.meta.url), Buffer.from(first.data, 'base64'));

// 0. At 1280 all four Stage lane labels and the Hard Stop card are on screen.
const inView = (sel) => js(`[...document.querySelectorAll(${JSON.stringify(sel)})].map((n) => { const r = n.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.top < innerHeight; })`);
const lanes = await inView('.react-flow__node-lane');
check('four lanes fit at 1280', lanes.length === 4 && lanes.every(Boolean), `lane labels in view: ${JSON.stringify(lanes)}`);

// 0b. Dragging a library card tints its own Stage lane.
await js(`document.querySelector('li[draggable]').dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: new DataTransfer() }))`);
await wait(300);
const tinted = await js(`[...document.querySelectorAll('.react-flow__node-lane')].filter((n) => n.textContent.includes('Drop here')).map((n) => n.textContent)`);
const libraryStage = await js(`document.querySelector('li[draggable]').children[1].textContent`);
check('drag tints the Journey Stage lane', tinted.length === 1 && tinted[0].startsWith(libraryStage), `tinted ${JSON.stringify(tinted)}, dragged card Stage ${JSON.stringify(libraryStage)}`);
await js(`document.querySelector('li[draggable]').dispatchEvent(new DragEvent('dragend', { bubbles: true }))`);

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
check('drag from library into its lane', dropped && droppedX >= 500 && droppedX < 750, `dropped over Pre-contract, card x=${droppedX} (Onboarding lane is 500 to 750)`);

// 2. Drag a card sideways into another lane: it stays in its own lane.
const payroll = await centre(node('i-payroll'));
await mouse(payroll, { x: payroll.x + 400, y: payroll.y });
const px = await posX('i-payroll');
check('card cannot leave its Stage lane', px >= 250 && px < 500, `dragged 400px right, card x=${px} (Pre-employment lane is 250 to 500)`);

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

// 5b. The side panel overlays the canvas: the Hard Stop card is still fully on screen.
const stopInView = await inView('.react-flow__node-hardStop');
const panelLeft = await js(`document.querySelector('aside[aria-label="Pathway Item"]').getBoundingClientRect().left`);
const stopRight = await js(`document.querySelector('.react-flow__node-hardStop').getBoundingClientRect().right`);
check('side panel leaves the Hard Stop visible', stopInView.every(Boolean) && stopRight <= panelLeft, `Hard Stop right edge ${stopRight}, panel left ${panelLeft}`);

// 5c. Removing a Dependency from the side panel drops its edge.
const edgesBefore = await js(`document.querySelectorAll('.react-flow__edge').length`);
const removed = await js(`(() => { const b = document.querySelector('button[aria-label="Remove the Dependency on Payroll"]'); b?.click(); return !!b; })()`);
await wait(300);
const edgesAfter = await js(`document.querySelectorAll('.react-flow__edge').length`);
check('removing a Dependency drops the edge', removed && edgesAfter === edgesBefore - 1, `edges ${edgesBefore} -> ${edgesAfter}`);

// 6. The fixture's Container, Timer and Hard Stop render.
const blocks = await js(`[...document.querySelectorAll('.react-flow__node-container, .react-flow__node-timer, .react-flow__node-hardStop')].map((n) => n.textContent)`);
check('Container, Timer and Hard Stop render', blocks.some((t) => t.includes('Cleared to start')) && blocks.some((t) => t.includes('7 days before start date')) && blocks.some((t) => t.includes('Pre-employment checks failed')), JSON.stringify(blocks));

const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(new URL('./after-drive-1280.png', import.meta.url), Buffer.from(shot.data, 'base64'));
writeFileSync(new URL('./drive-result.txt', import.meta.url), out.join('\n') + '\n');
process.stdout.write(out.join('\n') + '\n');
ws.close();
chrome.kill();

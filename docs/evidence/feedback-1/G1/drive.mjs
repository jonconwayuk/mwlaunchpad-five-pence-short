// G1: stretch-1/drive.mjs with check 8 asking the change kind at Publish, plus section 11 (library filters, pw-infra-e, semver). Stretch 1: final-fix/drive.mjs plus Timer authoring checks (section 10). Drives the DB-backed D2 canvas (adapted from B4/drive.mjs) in headless Chrome over the DevTools protocol (no extra dependency).
// Usage: node docs/evidence/launchpad-build/D2/drive.mjs http://localhost:3072/portal/pathways/pw-branch (freshly seeded db)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const url = process.argv[2];
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--remote-debugging-port=9336', '--user-data-dir=/tmp/g1-chrome', '--window-size=1280,800', 'about:blank',
], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1500);
const target = await (await fetch(`http://localhost:9336/json/new?${url}`, { method: 'PUT' })).json();
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
const posY = (id) => js(`new DOMMatrix(getComputedStyle(document.querySelector('${node(id)}')).transform).m42`);
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
check('four lanes fit at 1280', lanes.length === 4 && lanes.every(Boolean), `lane labels in view: ${JSON.stringify(lanes)} ${JSON.stringify(await js(`[...document.querySelectorAll('.react-flow__node-lane')].map((n) => { const r = n.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.top)]; })`))} innerWidth ${await js('innerWidth')}`);

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
await js(`[...document.querySelectorAll('[role=alert] button')].forEach((b) => b.click())`); // Got it
await wait(300);

// 4. A Dependency connects.
const before = await js(`document.querySelectorAll('.react-flow__edge').length`);
await mouse(await centre(`${node('i-payroll')} .react-flow__handle.source`), await centre(`${node('i-pulse-14')} .react-flow__handle.target`));
const after = await js(`document.querySelectorAll('.react-flow__edge').length`);
check('Dependency connects', after === before + 1, `edges ${before} -> ${after}`);

// 5. Mandatory toggles and shows a padlock.
const lockBefore = await js(`!!document.querySelector('${node('i-pulse-14')} [aria-label=Mandatory]')`);
await mouse({ x: 500, y: 760 }, { x: 500, y: 760 }); // click the empty pane to close the Payroll side panel, which overlays the fourth lane
const uniform = await centre(node('i-pulse-14'));
await mouse(uniform, uniform);
await js(`document.querySelector('[role=switch]').click()`);
await wait(300);
const lockAfter = await js(`!!document.querySelector('${node('i-pulse-14')} [aria-label=Mandatory]')`);
check('Mandatory toggles and shows a padlock', !lockBefore && lockAfter, `padlock on Pulse check ${lockBefore} -> ${lockAfter}`);

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

// 6. The seeded Container, Timer and Hard Stop render.
const blocks = await js(`[...document.querySelectorAll('.react-flow__node-container, .react-flow__node-timer, .react-flow__node-hardStop')].map((n) => n.textContent)`);
check('Container, Timer and Hard Stop render', blocks.some((t) => t.includes('Cleared to start')) && blocks.some((t) => t.includes('7 days before start date')) && blocks.some((t) => t.includes('Pre-employment checks failed')), JSON.stringify(blocks));

// 7. Autosave: move a card down its lane, wait past the 1-second debounce, reload: positions and the dropped card stay.
const buddy = await centre(node('i-buddy'));
await mouse(buddy, { x: buddy.x, y: buddy.y + 60 });
const want = { x: await posX('i-buddy'), y: await posY('i-buddy'), drop: droppedX };
await wait(1800);
const status = await js(`document.querySelector('[role=status]')?.textContent ?? ''`);
check('autosave after a change', status === 'Draft saved', JSON.stringify(status));
await send('Page.reload'); await wait(5000);
const got = { x: await posX('i-buddy'), y: await posY('i-buddy'), drop: await js(`!!document.querySelector('${node('i-j-branch-induction-1')}')`) ? await posX('i-j-branch-induction-1') : NaN };
check('reload keeps positions', got.x === want.x && got.y === want.y && got.drop === want.drop, `before ${JSON.stringify(want)}, after ${JSON.stringify(got)}`);

// 8. Publish shows the new version number.
const liveBefore = await js(`document.querySelector('header span').textContent`);
await js(`[...document.querySelectorAll('button')].find((b) => b.textContent === 'Publish').click()`);
await wait(300);
const asked = await js(`document.querySelector('[role=dialog]')?.getAttribute('aria-label') ?? ''`);
await js(`[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.startsWith('New content')).click()`);
await wait(5000); // the first publish compiles its route in dev
const header = await js(`document.querySelector('header span').textContent`);
const minor = (v) => { const [a, b] = v.split('.').map(Number); return `${a}.${b + 1}.0`; };
const seeded = liveBefore.replace('Live version ', '');
check('Publish asks the kind of change and shows the next semantic version', asked === 'What kind of change is this?' && header === `Live version ${minor(seeded)}`, `${JSON.stringify(liveBefore)} -> ${JSON.stringify(header)}, asked ${JSON.stringify(asked)}`);

// 10. Timer authoring: add a Timer, refuse a negative offset off the start date, make a card wait for it, autosave, reload.
const setVal = (sel, v) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false;
  const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(v)});
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return true; })()`);
const clickText = (text) => js(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent === ${JSON.stringify(text)}); b?.click(); return !!b; })()`);
const timerPanel = 'aside[aria-label="Timer"]';
await clickText('Add a Timer'); await wait(400);
const timerId = await js(`[...document.querySelectorAll('.react-flow__node-timer')].map((n) => n.dataset.id).find((id) => /^timer:t-[0-9]+$/.test(id))`);
await setVal(`${timerPanel} input:not([type])`, 'Welcome call');
await setVal(`${timerPanel} select`, 'offer-accepted');
await setVal(`${timerPanel} input[type=number]`, '-3');
await clickText('Save Timer'); await wait(300);
const refusal = await js(`document.querySelector('${timerPanel} [role=alert]')?.textContent ?? ''`);
check('negative offset off the start date is refused', refusal === 'Only a Timer anchored on the start date can count back before it.', JSON.stringify(refusal));
await setVal(`${timerPanel} select`, 'start-date');
await setVal(`${timerPanel} input[type=number]`, '2');
await clickText('Save Timer'); await wait(300);
const timerText = timerId ? await js(`document.querySelector('${node(timerId)}').textContent`) : '';
check('a Timer can be added', !!timerId && timerText === '2 days after start date', `${timerId}: ${JSON.stringify(timerText)}`);
const buddyAt = await centre(node('i-payroll')); // Buddy was moved below the fold in section 7
await mouse(buddyAt, buddyAt);
const tid = timerId?.slice('timer:'.length);
await setVal('select[aria-label="Wait for a Timer"]', tid); await wait(300);
const edgeSel = `.react-flow__edge[data-id="${timerId}->i-payroll"]`;
const waits = await js(`!!document.querySelector('${edgeSel}') && document.querySelector('aside[aria-label="Pathway Item"]').textContent.includes('Waits for 2 days after start date')`);
check('a Journey can wait for the Timer', waits, `edge ${timerId} -> i-payroll and side panel line: ${waits}`);
await wait(1800);
const saved2 = await js(`document.querySelector('[role=status]')?.textContent ?? ''`);
check('the Timer autosaves', saved2 === 'Draft saved', JSON.stringify(saved2));
await send('Page.reload'); await wait(5000);
const survived = await js(`!!document.querySelector('${node(timerId)}') && !!document.querySelector('${edgeSel}')`);
check('the Timer and its Dependency survive reload', survived, `Timer node and edge after reload: ${survived}`);
const timerAt = survived ? await centre(node(timerId)) : null;
// The Timer sits below the fold in Payroll's lane, so it is clicked in the DOM rather than at a screen point.
if (timerAt) { await js(`document.querySelector('${node(timerId)}').click()`); await wait(300); }
await clickText('Remove Timer'); await wait(300);
const keep = await js(`document.querySelector('${timerPanel} [role=alert]')?.textContent ?? ''`);
check('removing a Timer something waits for is refused', keep.includes('waits for Welcome call. Remove that Dependency first.') && !!(await js(`!!document.querySelector('${node(timerId)}')`)), `${JSON.stringify(keep)} timer at ${JSON.stringify(timerAt)}`);
const timerShot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(new URL('./timer-1280.png', import.meta.url), Buffer.from(timerShot.data, 'base64'));

const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(new URL('./after-drive-1280.png', import.meta.url), Buffer.from(shot.data, 'base64'));
// 9. Stage readiness at 1280 on each seeded Pathway: no Timer or Hard Stop covers a Journey card, nothing scrolls sideways.
const base = url.replace(/\/portal\/pathways\/.*$/, '');
for (const pw of ['pw-branch', 'pw-engineer', 'pw-executive']) {
  await send('Page.navigate', { url: `${base}/portal/pathways/${pw}` }); await wait(5000);
  const hits = await js(`(() => {
    const box = (sel) => [...document.querySelectorAll(sel)].map((n) => ({ id: n.dataset.id, r: n.getBoundingClientRect() }));
    const cards = box('.react-flow__node-journey'); const blocks = box('.react-flow__node-timer, .react-flow__node-hardStop');
    return blocks.flatMap((b) => cards.filter((c) => b.r.left < c.r.right && c.r.left < b.r.right && b.r.top < c.r.bottom && c.r.top < b.r.bottom).map((c) => b.id + ' on ' + c.id));
  })()`);
  check(`${pw}: no Timer or Hard Stop overlaps a Journey card`, hits.length === 0, JSON.stringify(hits));
  const sw = await js('document.documentElement.scrollWidth');
  check(`${pw}: no sideways scroll at 1280`, sw <= 1280, `scrollWidth ${sw}`);
  const pic = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL(`./${pw}-1280.png`, import.meta.url), Buffer.from(pic.data, 'base64'));
}

// 11. G1: on pw-infra-e, filter the library by Stage and grade E, drag a Journey on, draw a Dependency, refuse the loop, publish as New content, reload.
await send('Page.navigate', { url: `${base}/portal/pathways/pw-infra-e` }); await wait(5000);
await setVal('select[aria-label="Stage"]', 'onboarding');
await setVal('select[aria-label="Grade"]', 'E');
await setVal('select[aria-label="Job family"]', 'Executive'); await wait(300);
const count = () => js(`document.querySelectorAll('li[draggable]').length`);
await setVal('select[aria-label="Stage"]', ''); await setVal('select[aria-label="Grade"]', ''); await wait(300);
const nAll = await count();
await setVal('select[aria-label="Grade"]', 'E'); await wait(300);
const nGradeE = await count();
await setVal('select[aria-label="Grade"]', ''); await setVal('select[aria-label="Location"]', 'Cardiff'); await wait(300);
const nCardiff = await count();
await setVal('select[aria-label="Location"]', ''); await wait(300);
check('Grade E and Location Cardiff each narrow the library', nGradeE > 0 && nGradeE < nAll && nCardiff > 0 && nCardiff < nAll, `all ${nAll}, grade E ${nGradeE}, Cardiff ${nCardiff}`);
await setVal('select[aria-label="Stage"]', 'onboarding'); await setVal('select[aria-label="Grade"]', 'E'); await setVal('select[aria-label="Job family"]', 'Executive'); await wait(300);
const listed = await js(`[...document.querySelectorAll('li[draggable]')].map((li) => li.children[1].textContent)`);
const names = await js(`[...document.querySelectorAll('li[draggable] span')].map((x) => x.textContent)`);
await setVal('select[aria-label="Job family"]', ''); await wait(300);
check('library filters by Stage, grade E and job family', listed.length > 0 && listed.every((t) => t === 'Onboarding') && !names.some((n) => /Modern Workplace team access/.test(n)), `${listed.length} shown, Stages ${JSON.stringify([...new Set(listed)])}, names ${JSON.stringify(names)}`);
const ids = () => js(`[...document.querySelectorAll('.react-flow__node-journey')].map((n) => n.dataset.id)`);
const idsBefore = await ids();
const paneBox = await js(`(() => { const r = document.querySelector('.react-flow').getBoundingClientRect(); return { x: r.x + r.width * 0.6, y: r.y + 120 }; })()`);
await js(`(() => {
  const li = document.querySelector('li[draggable]'); const dt = new DataTransfer();
  li.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
  const pane = document.querySelector('.react-flow').parentElement;
  for (const type of ['dragover', 'drop']) pane.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: ${paneBox.x}, clientY: ${paneBox.y} }));
  li.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
})()`);
await wait(600);
const added = (await ids()).find((id) => !idsBefore.includes(id));
check('a filtered Journey drags onto pw-infra-e', !!added, `new card ${added}`);
const visibleOther = await js(`[...document.querySelectorAll('.react-flow__node-journey')].filter((n) => n.dataset.id !== ${JSON.stringify(added)}).map((n) => ({ id: n.dataset.id, r: n.getBoundingClientRect() })).filter(({ r }) => r.top > 200 && r.bottom < 780 && r.right < 1000).map(({ id }) => id)[0]`);
const e0 = await js(`document.querySelectorAll('.react-flow__edge').length`);
await mouse(await centre(`${node(visibleOther)} .react-flow__handle.source`), await centre(`${node(added)} .react-flow__handle.target`));
const e1 = await js(`document.querySelectorAll('.react-flow__edge').length`);
check('a Dependency draws on pw-infra-e', e1 === e0 + 1, `${visibleOther} -> ${added}: edges ${e0} -> ${e1}`);
await mouse(await centre(`${node(added)} .react-flow__handle.source`), await centre(`${node(visibleOther)} .react-flow__handle.target`));
const loopAlert = await js(`document.querySelector('[role=alert]')?.textContent ?? ''`);
check('the reverse Dependency is refused as a loop', loopAlert.includes('cannot wait for'), JSON.stringify(loopAlert));
await js(`[...document.querySelectorAll('[role=alert] button')].forEach((b) => b.click())`);
const infraBefore = (await js(`document.querySelector('header span').textContent`)).replace('Live version ', '');
await js(`[...document.querySelectorAll('button')].find((b) => b.textContent === 'Publish').click()`); await wait(300);
await js(`[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.startsWith('New content')).click()`); await wait(2500);
const infraAfter = await js(`document.querySelector('header span').textContent`);
check('pw-infra-e publishes as New content', infraAfter === `Live version ${minor(infraBefore)}`, `${infraBefore} -> ${JSON.stringify(infraAfter)}`);
await send('Page.reload'); await wait(5000);
const kept = await js(`[document.querySelector('header span').textContent, !!document.querySelector('${node(added)}'), !!document.querySelector('.react-flow__edge[data-id="${visibleOther}->${added}"]')]`);
check('reload keeps the version, the card and the Dependency', kept[0] === infraAfter && kept[1] && kept[2], JSON.stringify(kept));
const g1Shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(new URL('./g1-infra-1280.png', import.meta.url), Buffer.from(g1Shot.data, 'base64'));
await send('Page.navigate', { url: `${base}/portal/pathways` }); await wait(4000);
const libText = await js(`document.querySelector('main').textContent`);
check('the Pathway library shows semantic versions', /Version \d+\.\d+\.\d+/.test(libText), JSON.stringify(libText.match(/Version [\d.]+/g)));

writeFileSync(new URL('./drive-result.txt', import.meta.url), out.join('\n') + '\n');
process.stdout.write(out.join('\n') + '\n');
ws.close();
chrome.kill();

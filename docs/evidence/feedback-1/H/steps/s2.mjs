export default async (c) => {
  const { js, wait, send, select, click, shot, log, text } = c;
  const centre = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  const mouse = async (from, to) => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...from });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...from });
    for (let i = 1; i <= 10; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1, x: from.x + ((to.x - from.x) * i) / 10, y: from.y + ((to.y - from.y) * i) / 10 }); await wait(30); }
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...to }); await wait(400);
  };
  const lib = () => js(`[...document.querySelectorAll('li[draggable]')].map(l=>l.children[0]?.textContent).join(', ')`);
  log('2a stage: ' + await select(10, 'Onboarding')); await wait(400);
  log('2a grade: ' + await select(12, 'Grade E')); await wait(400);
  log('2a library now: ' + await lib());
  await shot('02-filtered');
  const ids = () => js(`[...document.querySelectorAll('.react-flow__node')].map(n=>n.dataset.id)`);
  const before = await ids();
  const drop = await centre('.react-flow__node[data-id="i-lab"]');
  await js(`(() => { const dt = new DataTransfer(); dt.setData('application/x-launchpad-journey', 'j-h-demo');
    const pane = document.querySelector('.react-flow').parentElement;
    for (const type of ['dragover', 'drop']) pane.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: ${drop.x}, clientY: ${drop.y + 90} })); })()`);
  await wait(800);
  const added = (await ids()).filter((i) => !before.includes(i));
  log('2b dropped node: ' + JSON.stringify(added));
  const n = added[0];
  const e0 = await js(`document.querySelectorAll('.react-flow__edge').length`);
  await mouse(await centre(`.react-flow__node[data-id="i-lab"] .react-flow__handle.source`), await centre(`.react-flow__node[data-id="${n}"] .react-flow__handle.target`));
  log('2c Dependency edges ' + e0 + ' -> ' + await js(`document.querySelectorAll('.react-flow__edge').length`));
  await mouse({ x: 640, y: 880 }, { x: 640, y: 880 });
  await mouse(await centre(`.react-flow__node[data-id="${n}"] .react-flow__handle.source`), await centre(`.react-flow__node[data-id="i-priv-access"] .react-flow__handle.target`));
  log('2d loop alert: ' + JSON.stringify(await js(`document.querySelector('[role=alert]')?.textContent ?? ''`)));
  await shot('02-loop-refused');
  await js(`[...document.querySelectorAll('[role=alert] button')].forEach((b) => b.click())`); await wait(300);
  log('2e publish: ' + await click('Publish')); await wait(600);
  log('2e dialog: ' + JSON.stringify(await js(`document.querySelector('[role=dialog]')?.innerText ?? 'none'`)));
  log('2e bump: ' + await click('New content')); await wait(3000);
  log('2e header: ' + ((await text()).match(/Live version [^\n]*/)?.[0]));
  await shot('02-published');
};

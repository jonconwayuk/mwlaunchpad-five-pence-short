// Takes a true 390px-wide screenshot of a URL through headless Chrome's DevTools protocol (Node 22, no deps).
// Usage: node shoot.mjs <url> <out.png> [chromePath]
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'] = process.argv.slice(2);
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'b3-'))}`, 'about:blank']);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let targets;
  for (let i = 0; i < 30 && !targets; i++) {
    await wait(300);
    targets = await fetch('http://127.0.0.1:9333/json').then((r) => r.json()).catch(() => undefined);
  }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (method, params = {}) => new Promise((resolve) => {
    const n = ++id;
    const on = (e) => { const m = JSON.parse(e.data); if (m.id === n) { ws.removeEventListener('message', on); resolve(m.result); } };
    ws.addEventListener('message', on);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url });
  await wait(6000);
  const { result } = await send('Runtime.evaluate', { expression: 'JSON.stringify({w: innerWidth, sw: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, statePolls: performance.getEntriesByType("resource").filter((e) => e.name.includes("/api/state")).length})', returnByValue: true });
  const m = JSON.parse(result.value);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: m.h, deviceScaleFactor: 2, mobile: true });
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  process.stdout.write(`viewport ${m.w}px, scrollWidth ${m.sw}px, height ${m.h}px, /api/state fetches in 6 s: ${m.statePolls}\n`);
  ws.close();
} finally {
  proc.kill();
}

// H2 walk helper (copy of H/cdp.mjs on ports 9360 and 3160): attaches to ONE already-open headless Chrome tab over the DevTools protocol (no extra dependency) and runs a step file against it.
// Start Chrome once: chrome --headless=new --remote-debugging-port=9360 --user-data-dir=/tmp/h2-chrome --window-size=1280,900 http://localhost:3160/portal
// Usage: node cdp.mjs <step.mjs>   (the step default-exports async (ctx) => {...})
import { writeFileSync, appendFileSync } from 'node:fs';
const [tab] = (await (await fetch('http://localhost:9360/json')).json()).filter((t) => t.type === 'page');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); pending.get(m.id)?.(m.result ?? m.error); });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const js = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r?.result?.value ?? r?.exceptionDetails?.exception?.description; };
const dir = new URL('./', import.meta.url);
const ctx = {
  send, wait, js,
  go: async (path) => { await send('Page.navigate', { url: `http://localhost:3160${path}` }); await wait(2500); },
  text: () => js('document.body.innerText'),
  shot: async (name) => { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(new URL(`${name}.png`, dir), Buffer.from(s.data, 'base64')); },
  // Clicks the first visible button or link whose text includes t.
  click: (t, sel = 'button, a, [role=button], summary') => js(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => b.offsetParent !== null && b.textContent.trim().includes(${JSON.stringify(t)})); if (!el) return 'NOT FOUND'; el.click(); return 'clicked'; })()`),
  // Sets a <select> (by its label text or index) to the option whose text includes t, firing React's change.
  select: (labelOrIdx, t) => js(`(() => { const ss = [...document.querySelectorAll('select')]; const s = typeof ${JSON.stringify(labelOrIdx)} === 'number' ? ss[${JSON.stringify(labelOrIdx)}] : ss.find((x) => (x.closest('label')?.textContent ?? x.getAttribute('aria-label') ?? '').includes(${JSON.stringify(labelOrIdx)})); if (!s) return 'NO SELECT'; const o = [...s.options].find((o) => o.textContent.includes(${JSON.stringify(t)}) || o.value === ${JSON.stringify(t)}); if (!o) return 'NO OPTION ' + [...s.options].map((o) => o.textContent).join('|'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return 'set ' + o.textContent; })()`),
  type: (sel, v) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'NO FIELD'; const p = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p, 'value').set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'typed'; })()`),
  log: (line) => { appendFileSync(new URL('walk-log.txt', dir), line + '\n'); process.stdout.write(line + '\n'); },
};
await send('Page.enable');
await send('Runtime.enable');
const step = (await import(new URL(process.argv[2], `file://${process.cwd()}/`))).default;
try { await step(ctx); } finally { ws.close(); }

import { rc } from './rc.mjs';
export default async (c) => {
  c.log('2 open: ' + await rc(c, 'Infrastructure engineer E', 'a'));
  for (let i = 0; i < 40 && (await c.js('location.pathname')) === '/portal/pathways'; i++) await c.wait(250);
  await c.wait(4000);
  c.log('2 url: ' + await c.js('location.pathname'));
  c.log('2 selects: ' + await c.js(`[...document.querySelectorAll('select')].map((s,i)=>i+':'+s.options[s.selectedIndex]?.text).join(' | ')`));
};

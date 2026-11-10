export default async ({ js, log }) => {
  log('d2 matches: ' + await js(`JSON.stringify([...document.querySelectorAll('*')].filter(e=>e.offsetParent && e.children.length===0 && /request is complete/i.test(e.textContent)).map(e=>{const b=e.getBoundingClientRect(); return {tag:e.tagName, role:e.closest('[role]')?.getAttribute('role'), top:Math.round(b.top), cls:e.className.slice(0,60)};}))`));
  log('d2 scroll: ' + await js(`JSON.stringify({sy: scrollY, sw: document.documentElement.scrollWidth, iw: innerWidth})`));
};

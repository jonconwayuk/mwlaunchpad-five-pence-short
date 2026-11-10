import { rc } from './rc.mjs';
export default async (c) => {
  const { js, wait, log, select } = c;
  for (let n = 0; n < 2; n++) {
    await rc(c, 'People', 'a'); for (let i = 0; i < 40 && (await js('location.pathname')) !== '/portal/people'; i++) await wait(250); await wait(1500);
    await c.type('input[placeholder*="Bob"]', 'Bob'); await wait(500);
    await rc(c, 'Bob Warwick', 'main a'); for (let i = 0; i < 40 && (await js('location.pathname')) === '/portal/people'; i++) await wait(250); await wait(2500);
    const from = await js('location.pathname');
    await select(0, 'Joiner'); let i = 0; for (; i < 40 && !(await js(`location.pathname.startsWith('/me')`)); i++) await wait(250);
    log(`sv try ${n}: from ${from} switch to Joiner ${i < 40 ? 'navigated in ' + i * 250 + ' ms' : 'DID NOT navigate in 10 s'}`);
    await select(0, 'Onboarding Studio'); for (i = 0; i < 40 && !(await js(`location.pathname.startsWith('/portal')`)); i++) await wait(250); await wait(1500);
  }
};

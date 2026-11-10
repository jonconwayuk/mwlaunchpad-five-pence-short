// The whole Bob walk in one run, in one tab: node cdp.mjs steps/walk.mjs (fresh seed; copies docs/demo/j-h-demo.json into journeys/ and deletes it before the final Reset).
import { copyFileSync, rmSync } from 'node:fs';
const step = async (n, ctx) => (await import(`./${n}.mjs`)).default(ctx);
const repo = new URL('../../../../../', import.meta.url);
export default async (ctx) => {
  await ctx.go('/portal'); await step('s0', ctx);
  ctx.log('setup person: ' + await ctx.select(1, 'Bob Warwick')); await ctx.wait(2500);
  copyFileSync(new URL('docs/demo/j-h-demo.json', repo), new URL('journeys/j-h-demo.json', repo));
  await step('s1', ctx);
  await ctx.go('/portal/pathways/pw-infra-e'); await ctx.wait(3000); await step('s2', ctx);
  await step('s3b', ctx); await step('s3c', ctx);
  ctx.log('3b apply: ' + await ctx.click('Apply pathway')); await ctx.wait(2500);
  ctx.log('3b applied: ' + (await ctx.text()).match(/Applied Pathway: [^\n]*/)?.[0]);
  await step('s3d', ctx);
  for (const n of ['s4', 's4b', 's4c', 's4d', 's5', 's5b', 's5d', 's5f', 's5g', 's5h', 's5i', 's5j', 's5k', 's6', 's7', 's7b', 's7c']) await step(n, ctx);
  rmSync(new URL('journeys/j-h-demo.json', repo));
  await ctx.go('/portal'); await step('s8', ctx);
};

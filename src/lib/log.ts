// Never pass personal data or secrets.
const write = (level: 'info' | 'warn' | 'error') => (msg: string, meta?: Record<string, unknown>) =>
  process.stderr.write(`${JSON.stringify({ level, msg, ...meta })}\n`);

export const log = { info: write('info'), warn: write('warn'), error: write('error') };

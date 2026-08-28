import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const staticSource = resolve(root, '.next/static');
const staticTarget = resolve(root, '.next/standalone/.next/static');

await mkdir(staticTarget, { recursive: true });
await cp(staticSource, staticTarget, { recursive: true, force: true });

console.log('standalone static assets prepared');

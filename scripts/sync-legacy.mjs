import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sourcePath = resolve(projectRoot, 'origin', 'index.html');
const targetPath = resolve(projectRoot, 'public', 'legacy', 'index.html');

await mkdir(dirname(targetPath), { recursive: true });
await copyFile(sourcePath, targetPath);

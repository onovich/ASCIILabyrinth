import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sourcePath = resolve(projectRoot, 'origin', 'index.html');
const targetPath = resolve(projectRoot, 'public', 'legacy', 'index.html');
const bgmSourceDir = resolve(projectRoot, 'bgm');
const bgmTargetDir = resolve(projectRoot, 'public', 'legacy', 'bgm');

await mkdir(dirname(targetPath), { recursive: true });
await copyFile(sourcePath, targetPath);

const bgmEntries = await readdir(bgmSourceDir, { withFileTypes: true }).catch((error) => {
	if (error.code === 'ENOENT') {
		return [];
	}

	throw error;
});

await mkdir(bgmTargetDir, { recursive: true });
await Promise.all(
	bgmEntries
		.filter((entry) => entry.isFile())
		.map((entry) =>
			copyFile(resolve(bgmSourceDir, entry.name), resolve(bgmTargetDir, entry.name))
		)
);

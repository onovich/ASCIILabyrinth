import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sourcePath = resolve(projectRoot, 'origin', 'index.html');
const targetPath = resolve(projectRoot, 'public', 'runtime', 'index.html');
const bgmSourceDir = resolve(projectRoot, 'bgm');
const bgmTargetDir = resolve(projectRoot, 'public', 'runtime', 'bgm');
const sharedSourceDir = resolve(projectRoot, 'origin', 'shared');
const sharedTargetDir = resolve(projectRoot, 'public', 'shared');
const runtimeSharedTargetDir = resolve(projectRoot, 'public', 'runtime', 'shared');
const editorSourceDir = resolve(projectRoot, 'origin', 'editor');
const editorTargetDir = resolve(projectRoot, 'public', 'editor');
const modelEditorSourceDir = resolve(projectRoot, 'origin', 'model-editor');
const modelEditorTargetDir = resolve(projectRoot, 'public', 'model-editor');

async function copyDirectory(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  });

  await mkdir(targetDir, { recursive: true });
  await Promise.all(
    entries.map((entry) => {
      const source = resolve(sourceDir, entry.name);
      const target = resolve(targetDir, entry.name);
      if (entry.isDirectory()) {
        return copyDirectory(source, target);
      }

      return copyFile(source, target);
    }),
  );
}

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
      copyFile(resolve(bgmSourceDir, entry.name), resolve(bgmTargetDir, entry.name)),
    ),
);

await copyDirectory(editorSourceDir, editorTargetDir);
await copyDirectory(modelEditorSourceDir, modelEditorTargetDir);
await copyDirectory(sharedSourceDir, sharedTargetDir);
await copyDirectory(sharedSourceDir, runtimeSharedTargetDir);

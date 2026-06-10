import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const projectPath = (...segments) => resolve(projectRoot, ...segments);

const fileCopyJobs = [
  {
    source: projectPath('origin', 'index.html'),
    target: projectPath('public', 'runtime', 'index.html')
  }
];

const fileOnlyDirectoryCopyJobs = [
  {
    source: projectPath('bgm'),
    target: projectPath('public', 'runtime', 'bgm')
  }
];

const directoryCopyJobs = [
  {
    source: projectPath('origin', 'runtime'),
    target: projectPath('public', 'runtime', 'runtime')
  },
  {
    source: projectPath('origin', 'editor'),
    target: projectPath('public', 'editor')
  },
  {
    source: projectPath('origin', 'model-editor'),
    target: projectPath('public', 'model-editor')
  },
  {
    source: projectPath('origin', 'shared'),
    target: projectPath('public', 'shared')
  },
  {
    source: projectPath('origin', 'shared'),
    target: projectPath('public', 'runtime', 'shared')
  }
];

async function readDirectoryEntries(sourceDir) {
  return readdir(sourceDir, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  });
}

async function copyProjectFile(source, target) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function copyDirectory(sourceDir, targetDir) {
  const entries = await readDirectoryEntries(sourceDir);
  await mkdir(targetDir, { recursive: true });
  await Promise.all(
    entries.map((entry) => {
      const source = resolve(sourceDir, entry.name);
      const target = resolve(targetDir, entry.name);
      if (entry.isDirectory()) {
        return copyDirectory(source, target);
      }

      return copyProjectFile(source, target);
    }),
  );
}

async function copyFilesInDirectory(sourceDir, targetDir) {
  const entries = await readDirectoryEntries(sourceDir);
  await mkdir(targetDir, { recursive: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => copyProjectFile(resolve(sourceDir, entry.name), resolve(targetDir, entry.name))),
  );
}

await Promise.all(fileCopyJobs.map(({ source, target }) => copyProjectFile(source, target)));
await Promise.all(fileOnlyDirectoryCopyJobs.map(({ source, target }) => copyFilesInDirectory(source, target)));
await Promise.all(directoryCopyJobs.map(({ source, target }) => copyDirectory(source, target)));

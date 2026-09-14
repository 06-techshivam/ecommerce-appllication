import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const TOKEN = process.env.GITHUB_PAT || process.argv[2];
if (!TOKEN) {
  console.error('❌ Error: GITHUB_PAT not found in environment or argument.');
  process.exit(1);
}
const OWNER = "06-techshivam";
const REPO = "ecommerce-appllication";
const BRANCH = "main";
const COMMIT_MESSAGE = process.env.COMMIT_MESSAGE || "docs: Update live site link in README.md";

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

// Exclusion rules matching .gitignore
const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.insforge',
  '.git',
  '.vercel',
  '.vscode',
  '.idea',
  'coverage',
  'build',
  'out',
]);

const IGNORED_FILES = new Set([
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  'Desktop.ini',
]);

function shouldIgnore(relPath, isDir) {
  const normalized = relPath.replace(/\\/g, '/');
  const segments = normalized.split('/');
  const baseName = segments[segments.length - 1];

  for (const seg of segments) {
    if (IGNORED_DIRS.has(seg)) return true;
  }

  if (isDir) {
    return IGNORED_DIRS.has(baseName);
  }

  if (IGNORED_FILES.has(baseName)) return true;

  // Ignore secret env files except .env.example
  if (baseName.startsWith('.env') && baseName !== '.env.example') return true;

  // Ignore certificates/keys
  if (baseName.endsWith('.pem') || baseName.endsWith('.key') || baseName.endsWith('.cert')) return true;

  // Ignore logs
  if (baseName.endsWith('.log')) return true;

  return false;
}

function getAllFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const relPath = path.join(base, entry.name);
    if (shouldIgnore(relPath, entry.isDirectory())) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      files.push({ fullPath, relPath: relPath.replace(/\\/g, '/') });
    }
  }

  return files;
}

async function githubRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('https://') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'Zenvora-GitHub-Uploader',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const error = new Error(`GitHub API ${options.method || 'GET'} ${url} returned ${res.status}: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function upload() {
  console.log('----------------------------------------------------');
  console.log(`Starting Upload to GitHub: https://github.com/${OWNER}/${REPO}`);
  console.log(`Target Branch: ${BRANCH}`);
  console.log('----------------------------------------------------\n');

  // 1. Verify user & repo access
  console.log('1. Verifying GitHub credentials...');
  const user = await githubRequest('https://api.github.com/user');
  console.log(`   Authenticated as: ${user.login}`);

  const repo = await githubRequest('');
  console.log(`   Connected to repository: ${repo.full_name} (${repo.visibility || 'public'})`);

  // 2. Discover files
  console.log('\n2. Scanning project files for upload...');
  const files = getAllFiles(ROOT_DIR);
  console.log(`   Found ${files.length} project files to commit and upload.`);

  // Double check critical exclusions
  const violations = files.filter(f =>
    f.relPath.includes('node_modules') ||
    f.relPath.includes('.next') ||
    f.relPath.includes('.insforge') ||
    (f.relPath.startsWith('.env') && f.relPath !== '.env.example')
  );
  if (violations.length > 0) {
    throw new Error(`Security check failed! Sensitive files were detected: ${violations.map(v => v.relPath).join(', ')}`);
  }
  console.log('   Security verification passed: 0 secrets or build caches included.');

  // 3. Ensure Git Database is initialized on GitHub
  console.log('\n3. Checking repository initialization...');
  let parentCommitSha = null;
  try {
    const refData = await githubRequest(`/git/ref/heads/${BRANCH}`);
    parentCommitSha = refData.object.sha;
    console.log(`   Repository already has branch '${BRANCH}' (Commit: ${parentCommitSha})`);
  } catch (err) {
    if (err.status === 404 || err.status === 409) {
      console.log('   Repository is empty. Initializing with root commit via Contents API...');
      const readmePath = path.join(ROOT_DIR, 'README.md');
      const readmeContent = fs.existsSync(readmePath)
        ? fs.readFileSync(readmePath, 'utf8')
        : '# Zenvora Luxury Fashion eCommerce Platform';
      
      const initRes = await githubRequest('/contents/README.md', {
        method: 'PUT',
        body: JSON.stringify({
          message: 'chore: Initialize repository',
          content: Buffer.from(readmeContent).toString('base64'),
          branch: BRANCH,
        }),
      });
      parentCommitSha = initRes.commit.sha;
      console.log(`   Repository initialized on '${BRANCH}' with commit: ${parentCommitSha}`);
    } else {
      throw err;
    }
  }

  // 4. Create Git Blobs on GitHub
  console.log('\n4. Creating Git Blobs on GitHub...');
  const treeItems = [];
  const CONCURRENCY = 5;
  let completed = 0;

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const chunk = files.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (file) => {
        const buffer = fs.readFileSync(file.fullPath);
        const base64Content = buffer.toString('base64');

        const blob = await githubRequest('/git/blobs', {
          method: 'POST',
          body: JSON.stringify({
            content: base64Content,
            encoding: 'base64',
          }),
        });

        treeItems.push({
          path: file.relPath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });

        completed++;
        if (completed % 10 === 0 || completed === files.length) {
          process.stdout.write(`   Uploaded blobs: ${completed}/${files.length}\r`);
        }
      })
    );
  }
  console.log(`\n   All ${files.length} blobs successfully uploaded.`);

  // 5. Create Git Tree
  console.log('\n5. Creating Git Tree...');
  const tree = await githubRequest('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      tree: treeItems,
    }),
  });
  console.log(`   Git tree created (SHA: ${tree.sha})`);

  // 6. Create Commit
  console.log('\n6. Creating Git Commit...');
  const commitPayload = {
    message: COMMIT_MESSAGE,
    tree: tree.sha,
    parents: parentCommitSha ? [parentCommitSha] : [],
  };

  const commit = await githubRequest('/git/commits', {
    method: 'POST',
    body: JSON.stringify(commitPayload),
  });
  console.log(`   Commit created: ${commit.sha}`);

  // 7. Update Ref to point to new commit
  console.log('\n7. Updating branch reference...');
  await githubRequest(`/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: commit.sha,
      force: true,
    }),
  });
  console.log(`   Branch refs/heads/${BRANCH} successfully updated.`);

  // 8. Ensure repository default branch is main
  try {
    await githubRequest('', {
      method: 'PATCH',
      body: JSON.stringify({
        default_branch: BRANCH,
      }),
    });
    console.log(`   Repository default branch confirmed as '${BRANCH}'.`);
  } catch {
    // ignore
  }

  console.log('\n====================================================');
  console.log('🎉 UPLOAD COMPLETE & VERIFIED!');
  console.log(`Repository: https://github.com/${OWNER}/${REPO}`);
  console.log(`Branch:     ${BRANCH}`);
  console.log(`Commit:     ${commit.sha}`);
  console.log(`Files:      ${files.length} project files uploaded.`);
  console.log('====================================================\n');
}

upload().catch((err) => {
  console.error('\n❌ Upload failed:', err.message);
  process.exit(1);
});


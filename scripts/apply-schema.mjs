import fs from 'fs';
import { execSync } from 'child_process';

const sql = fs.readFileSync('scripts/setup-db.sql', 'utf8');

// Strip SQL comments
const cleanSql = sql
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n')
  .trim();

console.log('Applying SQL schema...');
try {
  const result = execSync(`npx @insforge/cli db query ${JSON.stringify(cleanSql)}`, {
    encoding: 'utf8',
    env: { ...process.env, Path: "C:\\Users\\akhil\\.nodejs\\node-v22.23.2-win-x64;" + process.env.Path }
  });
  console.log(result);
  console.log('Schema applied successfully.');
} catch (err) {
  console.error('Error applying schema:', err.stdout || err.message);
  process.exit(1);
}


import fs from 'fs';
import { execSync } from 'child_process';

const sql = fs.readFileSync('migrations/20260910161500_update-google-upi-id.sql', 'utf8');

const cleanSql = sql
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
  .join(' ')
  .trim();

console.log('Applying Google UPI SQL changes to InsForge database...');
console.log('Query:', cleanSql);

try {
  const result = execSync(`npx @insforge/cli db query ${JSON.stringify(cleanSql)}`, {
    encoding: 'utf8',
    env: { ...process.env, Path: "C:\\Users\\akhil\\.nodejs\\node-v22.23.2-win-x64;" + process.env.Path }
  });
  console.log('Output:', result);
  console.log('✓ Successfully updated orders payment_method default to Google UPI (8451093907@ybl).');
} catch (err) {
  console.error('Error applying schema:', err.stdout || err.message);
  process.exit(1);
}


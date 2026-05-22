import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '..');
const localEnvPaths = [
  resolve(workspaceRoot, 'apps/api/.env.local'),
  resolve(workspaceRoot, 'apps/api/.env'),
  resolve(workspaceRoot, '.env.local'),
  resolve(workspaceRoot, '.env'),
];

for (const envPath of localEnvPaths) {
  loadEnvFile(envPath);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const webEnvFiles = [
  resolve(workspaceRoot, 'apps/web/src/environments/environment.local.ts'),
  resolve(workspaceRoot, 'apps/web/src/environments/environment.local.prod.ts'),
];

if (!hasRealSupabaseConfig(supabaseUrl, supabasePublishableKey)) {
  for (const filePath of webEnvFiles) {
    if (!existsSync(filePath)) {
      writeEnvironmentFile(filePath, {
        supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
        supabasePublishableKey: 'YOUR_PUBLISHABLE_KEY',
      });
    }
  }
  console.log('Web environment files already exist or placeholders were created.');
  process.exit(0);
}

for (const filePath of webEnvFiles) {
  writeEnvironmentFile(filePath, { supabaseUrl, supabasePublishableKey });
}

console.log('Web environment files generated from SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] ??= value;
  }
}

function writeEnvironmentFile(filePath, values) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    `export const localEnvironment = {
  supabaseUrl: ${JSON.stringify(values.supabaseUrl)},
  supabasePublishableKey: ${JSON.stringify(values.supabasePublishableKey)},
};
`,
  );
}

function hasRealSupabaseConfig(supabaseUrl, supabasePublishableKey) {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabasePublishableKey) &&
    !supabaseUrl.includes('YOUR_PROJECT_REF') &&
    supabasePublishableKey !== 'YOUR_PUBLISHABLE_KEY'
  );
}

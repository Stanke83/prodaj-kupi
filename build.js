// build.js — zamenjuje placeholdere sa env varijablama pre deploymenta
const fs = require('fs');
const path = require('path');

const SB_URL = process.env.VITE_SB_URL || process.env.SB_URL;
const SB_KEY = process.env.VITE_SB_KEY || process.env.SB_KEY;

if (!SB_URL || !SB_KEY) {
  console.error('ERROR: SB_URL i SB_KEY env varijable nisu postavljene!');
  process.exit(1);
}

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'build.js') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'vendor') processDir(full);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html')) {
      if (entry.name === 'supabase.min.js') continue;
      let content = fs.readFileSync(full, 'utf8');
      const newContent = content.replace(/__SB_URL__/g, SB_URL).replace(/__SB_KEY__/g, SB_KEY);
      if (newContent !== content) {
        fs.writeFileSync(full, newContent);
        console.log('Processed:', full);
      }
    }
  }
}

processDir('.');
console.log('Build complete.');

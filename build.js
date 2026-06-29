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
      const newContent = content.replace(/https://iyuyhbgampbwkxlbdgvi.supabase.co/g, SB_URL).replace(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA/g, SB_KEY);
      if (newContent !== content) {
        fs.writeFileSync(full, newContent);
        console.log('Processed:', full);
      }
    }
  }
}

processDir('.');
console.log('Build complete.');

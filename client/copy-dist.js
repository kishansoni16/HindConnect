import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, 'dist');
const dest = path.join(__dirname, '../dist');

try {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('Successfully mirrored client/dist to root dist');
  }
} catch (err) {
  console.error('Notice during mirroring dist:', err.message);
}

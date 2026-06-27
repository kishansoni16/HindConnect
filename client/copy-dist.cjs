const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dist');
const dest = path.join(__dirname, '../dist');

try {
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('Successfully mirrored client/dist to root dist');
  } else {
    console.log('Source dist not found at:', src);
  }
} catch (err) {
  console.error('Notice during mirroring dist:', err.message);
}

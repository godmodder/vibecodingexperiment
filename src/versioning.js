const fs = require('fs');
const path = require('path');
const Y = require('yjs');

function persistUpdates(updates, dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  updates.forEach((u, idx) => {
    const file = path.join(dir, `update-${idx}.bin`);
    fs.writeFileSync(file, Buffer.from(u));
  });
}

function loadUpdates(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.bin'))
    .sort();
  return files.map(f => fs.readFileSync(path.join(dir, f)));
}

function replayUpdates(updates, doc) {
  updates.forEach(u => Y.applyUpdate(doc, u));
}

module.exports = { persistUpdates, loadUpdates, replayUpdates };

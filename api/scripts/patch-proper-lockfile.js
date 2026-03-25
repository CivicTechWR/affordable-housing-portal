/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const file = path.join(
  __dirname,
  '../node_modules/proper-lockfile/lib/lockfile.js',
);

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('const _onExit')) {
    content = content.replace(
      'onExit(() => {',
      'const _onExit = typeof onExit === "function" ? onExit : onExit.onExit || onExit.default;\n_onExit(() => {',
    );
    fs.writeFileSync(file, content);
    console.log('Successfully patched proper-lockfile.');
  }
}

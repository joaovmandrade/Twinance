/**
 * Creates a no-op stub for `react-native-worklets/plugin`.
 *
 * WHY: react-native-css-interop@0.2.x (used by NativeWind 4.2.x) hardcodes
 * "react-native-worklets/plugin" in its babel preset — a plugin that only
 * exists in react-native-reanimated v4+. We use Reanimated v3, so we provide
 * an empty babel plugin shim to keep the bundler happy without side effects.
 *
 * Run automatically via the `postinstall` npm script.
 */
const fs   = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'node_modules', 'react-native-worklets')
fs.mkdirSync(dir, { recursive: true })

fs.writeFileSync(
  path.join(dir, 'package.json'),
  JSON.stringify({ name: 'react-native-worklets', version: '0.0.0-stub', main: 'index.js' }, null, 2),
)

// no-op babel plugin — satisfies the require() without doing anything
fs.writeFileSync(
  path.join(dir, 'plugin.js'),
  'module.exports = function reactNativeWorkletsStub() { return { visitor: {} }; };\n',
)

fs.writeFileSync(
  path.join(dir, 'index.js'),
  '// stub\n',
)

console.log('  ✓  Patched: react-native-worklets/plugin (no-op stub for Reanimated 3)')

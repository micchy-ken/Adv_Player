const fs = require('fs');
let code = fs.readFileSync('src/data/scenarios.ts', 'utf-8');

// Remove name fields
code = code.replace(/\n\s*name:\s*"[^"]*",/g, '');

// Extract "汎用" block
const anyBlockRegex = /  "汎用": \{\n    id: "汎用",\n    themeColor: "slate",\n    characters: \{\n      "男性": \{\n        key: "男性",\n        displayName: "男性",\n        avatarUrl: 'data:image\/svg\+xml;utf8,<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 24 24" fill="%23333333"><path d="M12 12c2\.21 0 4-1\.79 4-4s-1\.79-4-4-4-4 1\.79-4 4 1\.79 4 4 4zm0 2c-2\.67 0-8 1\.34-8 4v2h16v-2c0-2\.66-5\.33-4-8-4z"\/><\/svg>',\n        color: "#475569", \/\/ slate-600\n        position: "left"\n      \},\n      "女性": \{\n        key: "女性",\n        displayName: "女性",\n        avatarUrl: 'data:image\/svg\+xml;utf8,<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 24 24" fill="%23333333"><path d="M12 12c2\.21 0 4-1\.79 4-4s-1\.79-4-4-4-4 1\.79-4 4 1\.79 4 4 4zm0 2c-2\.67 0-8 1\.34-8 4v2h16v-2c0-2\.66-5\.33-4-8-4z"\/><\/svg>', \/\/ A generic placeholder since simple silhouette is requested\.\n        color: "#f43f5e", \/\/ rose-500\n        position: "right"\n      \}\n    \},\n    scenes: \{\n      "標準": "https:\/\/images\.unsplash\.com\/photo-1500382017468-9049fed747ef\?auto=format&fit=crop&w=1200&q=80",\n      "地平線": "https:\/\/images\.unsplash\.com\/photo-1500382017468-9049fed747ef\?auto=format&fit=crop&w=1200&q=80"\n    \}\n  \},\n/s;

let match = code.match(anyBlockRegex);
if (match) {
  let block = match[0];
  code = code.replace(block, '');
  code = code.replace('export const DEFAULT_SCENARIOS: Record<string, ScenarioConfig> = {\n', 'export const DEFAULT_SCENARIOS: Record<string, ScenarioConfig> = {\n' + block);
  fs.writeFileSync('src/data/scenarios.ts', code);
  console.log('Successfully reordered and removed name properties.');
} else {
  console.log('Block not found');
}

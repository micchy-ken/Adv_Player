const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regexA = /\{\/\* Method A: postMessage Embedding \(Safe, highly interactive\) \*\/\}.*?(?=\{\/\* Method B: Static url parameter \*\/\})/s;
const regexB = /\{\/\* Method B: Static url parameter \*\/\}.*?(?=\{\/\* Method C: Referrer auto-read \*\/\})/s;
const regexC = /\{\/\* Method C: Referrer auto-read \*\/\}.*?(?=\{\/\* Method D: Dynamic HTML Scripting)/s;
const regexD = /\{\/\* Method D: Dynamic HTML Scripting.*?col-span-full">.*?<\/div>\n              <\/div>\n/s;

let matchA = code.match(regexA)[0];
let matchB = code.match(regexB)[0];
let matchC = code.match(regexC)[0];
let matchD = code.match(regexD)[0];

matchA = matchA.replace('方式 A', '方式 D');
matchA = matchA.replace('Method A', 'Method D');

matchB = matchB.replace('方式 B', '方式 A');
matchB = matchB.replace('Method B', 'Method A');

matchC = matchC.replace('方式 C', '方式 B');
matchC = matchC.replace('Method C', 'Method B');

matchD = matchD.replace('方式 D', '方式 C');
matchD = matchD.replace('Method D', 'Method C');

const newOrder = matchB + matchC + matchD + "\n              " + matchA;

const fullRegex = /\{\/\* Method A: postMessage Embedding \(Safe, highly interactive\) \*\/\}.*?<\/div>\n              <\/div>\n/s;
code = code.replace(fullRegex, newOrder);

code = code.replace(/その場合「方式C」を利用すると/g, 'その場合「方式B」を利用すると');
code = code.replace(/「方式C」の欄に記載した/g, '「方式B」の欄に記載した');
code = code.replace(/「方式D」の動的/g, '「方式C」の動的');

fs.writeFileSync('src/App.tsx', code);

import { parseBlogContent } from './src/utils/parser';

const text = `
【タイトル】
テストタイトル

【汎用】
シーン：王宮

由香里：こんにちは！
【続く】
異世界オーガニックカレー -002これがオーガニックカレー - micchy_kensuke’s blog https://micchy-kensuke.hatenablog.com/entry/2026/06/27/161932
`;

const res = parseBlogContent(text);
console.log(JSON.stringify(res, null, 2));

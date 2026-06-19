import { parseBlogContent } from "./src/utils/parser";
const text = `
～雑文～

【上司と部下「もしも苗字が三井だったら」】

【登場人物】上司、部下

上司：三井さんに産まれたかったの

【終了】
`;
console.log(JSON.stringify(parseBlogContent(text), null, 2));

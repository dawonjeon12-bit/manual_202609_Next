// 원본 manual_1/app.js 의 renderMarkdown() 을 그대로 떼어 실행해 입출력 스냅샷을 만든다.
// 사용: node scripts/snapshot-original-markdown.mjs <원본 app.js 경로>
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const pick = (a, b) => src.slice(a - 1, b).join('\n');
const code = [pick(8, 9), pick(49, 49), pick(51, 123), pick(127, 205), pick(554, 657), 'globalThis.out = { renderMarkdown, sampleDoc, toMarkdown, toHTML };']
  .join('\n').replace('const uid = ', 'var uid = ');
const ctx = { uid: () => 'x', Date };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { renderMarkdown, sampleDoc, toMarkdown, toHTML } = ctx.out;

const inputs = [
  ...sampleDoc().sections.map(s => s.body),
  '',
  '## 큰 제목\n### 소제목\n#### 작은 제목',
  '> 첫 줄\n> 둘째 줄 **강조**',
  '- 하나\n- 둘\n- [ ] 점검\n- [x] 완료',
  '1) 괄호 번호\n2) 두 번째\n\n3. 점 번호',
  '문단 <script>alert(1)</script> & "따옴표" \'홑\'\n이어지는 줄 `code`',
  '**Q. 질문만 있음**',
  '**Q: 콜론 질문**\nA: 답 첫 줄\n답 둘째 줄',
  '| a | b |\n|:--|--:|\n| 1 | **2** |\n\n뒤 문단',
  '* 별표 목록\n* 둘째\n\n일반 문단\n- 목록으로 끊김',
  '\r\nCRLF 문단\r\n두 번째 줄\r\n\r\n- 목록',
];
const cases = inputs.map(input => ({ input, output: renderMarkdown(input) }));
fs.writeFileSync(new URL('../tests/fixtures/markdown-original.json', import.meta.url), JSON.stringify(cases, null, 2) + '\n');
const doc = JSON.parse(JSON.stringify(sampleDoc()));
fs.writeFileSync(new URL('../tests/fixtures/export-original.json', import.meta.url),
  JSON.stringify({ doc, markdown: toMarkdown(doc), html: toHTML(doc) }, null, 2) + '\n');
console.log(`${cases.length} cases written`);

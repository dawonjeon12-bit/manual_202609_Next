/* 내보내기 — 원본 app.js toMarkdown() / toHTML() / safeName() 을 그대로 이식.
   다운로드는 Artifact 샌드박스의 downloads 대신 브라우저 기본 다운로드(Blob + a[download]). */
import { esc, renderMarkdown } from './markdown';
import type { Manual, Section } from './manual';

type Doc = Pick<Manual, 'title' | 'kind' | 'code' | 'rev' | 'effectiveDate' | 'owner' | 'approver'> & {
  sections: Pick<Section, 'type' | 'title' | 'body'>[];
};

export function toMarkdown(doc: Doc): string {
  const L = [`# ${doc.title || '제목 없는 매뉴얼'}`, ''];
  L.push('| 문서번호 | 개정 | 시행일 | 관리부서 | 승인 |');
  L.push('| --- | --- | --- | --- | --- |');
  L.push(`| ${doc.code || '-'} | ${doc.rev || '-'} | ${doc.effectiveDate || '-'} | ${doc.owner || '-'} | ${doc.approver || '-'} |`);
  L.push('');
  doc.sections.forEach((s, i) => {
    L.push(`## ${i + 1}. ${s.title}`);
    L.push('');
    L.push(s.body || '_(비어 있음)_');
    L.push('');
  });
  return L.join('\n');
}

export function toHTML(doc: Doc): string {
  const meta = [['문서번호', doc.code], ['개정', doc.rev], ['시행일', doc.effectiveDate],
                ['관리부서', doc.owner], ['승인', doc.approver]]
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || '-')}</dd></div>`).join('');
  const secs = doc.sections.map((s, i) =>
    `<section data-type="${esc(s.type)}"><h2><b>${String(i + 1).padStart(2, '0')}</b>${esc(s.title)}</h2>${renderMarkdown(s.body)}</section>`).join('\n');
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(doc.title || '업무 매뉴얼')}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+KR:wght@300..700&display=swap">
<style>
:root{
 --ink:#000; --canvas:#fff; --hair:#e6e6e6; --hair2:#f1f1f1; --soft:#f7f7f5;
 --lime:#dceeb1; --lilac:#c5b0f4; --cream:#f4ecd6; --pink:#efd4d4; --mint:#c8e6cd; --coral:#f3c9b6;
 --sans:"Inter","Noto Sans KR",-apple-system,"Apple SD Gothic Neo",sans-serif;
 --mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
 color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--canvas);color:var(--ink);font-family:var(--sans);
 font-size:18px;font-weight:320;line-height:1.62;letter-spacing:-.26px;
 word-break:keep-all;overflow-wrap:break-word;font-feature-settings:"kern" 1;-webkit-font-smoothing:antialiased}
main{max-width:800px;margin:40px auto;padding:32px;border:1px solid var(--hair);border-radius:24px}
.kind{font-family:var(--mono);font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#6b6b6b;margin-bottom:10px}
h1{font-size:40px;font-weight:340;line-height:1.12;letter-spacing:-.02em;margin:0 0 24px;text-wrap:balance}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(122px,1fr));margin:0 0 8px;padding:0;
 border:1px solid var(--hair);border-radius:8px;overflow:hidden}
dl>div{padding:9px 13px;border-right:1px solid var(--hair2)}
dl>div:last-child{border-right:0}
dt{font-family:var(--mono);font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:#6b6b6b}
dd{margin:0;font-family:var(--mono);font-size:12.5px;font-variant-numeric:tabular-nums}
section{border-top:1px solid var(--hair2);padding-top:24px;margin-top:24px}
h2{font-size:22px;font-weight:540;line-height:1.32;letter-spacing:-.32px;margin:0 0 16px;display:flex;gap:12px;align-items:center}
h2 b{font-family:var(--mono);font-size:11px;font-weight:400;letter-spacing:.5px;padding:4px 8px;border-radius:6px;background:var(--soft)}
section[data-type="개요"] h2 b{background:var(--cream)}
section[data-type="절차"] h2 b{background:var(--lilac)}
section[data-type="체크리스트"] h2 b{background:var(--mint)}
section[data-type="기준"] h2 b{background:var(--lime)}
section[data-type="주의"] h2 b{background:var(--pink)}
section[data-type="FAQ"] h2 b{background:var(--coral)}
h3{font-size:18px;font-weight:640;letter-spacing:-.26px;margin:32px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--hair)}
h4{font-size:17px;font-weight:540;margin:24px 0 6px}
p{margin:0 0 16px}
strong{font-weight:640}
section[data-type="개요"]>p:first-of-type{font-size:20px;font-weight:330;line-height:1.5;letter-spacing:-.14px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--hair)}
ul{margin:0 0 16px;padding-left:0;list-style:none}
ul>li{position:relative;padding-left:18px;margin-bottom:8px}
ul>li:before{content:"";position:absolute;left:3px;top:.72em;width:4px;height:4px;border-radius:9999px;background:var(--ink)}
ol{margin:0 0 24px;padding-left:0;list-style:none;counter-reset:step}
ol>li{counter-increment:step;position:relative;padding-left:46px;margin-bottom:16px}
ol>li:before{content:counter(step,decimal-leading-zero);position:absolute;left:0;top:.18em;min-width:30px;padding:3px 0;
 text-align:center;font-family:var(--mono);font-size:11px;letter-spacing:.5px;background:var(--lilac);border-radius:6px}
ul.task{border:1px solid var(--hair);border-radius:8px;overflow:hidden;margin:0 0 24px}
ul.task li{padding:12px 16px 12px 42px;margin:0;font-size:16px;font-weight:330;line-height:1.5;letter-spacing:-.14px;border-bottom:1px solid var(--hair2)}
ul.task li:last-child{border-bottom:0}
ul.task li:before{content:"";left:16px;top:14px;width:15px;height:15px;border:1.5px solid var(--ink);border-radius:2px;background:var(--canvas)}
.tablewrap{margin:24px 0;overflow-x:auto;border:1px solid var(--hair);border-radius:8px}
table{border-collapse:collapse;width:100%;min-width:360px;font-size:16px}
thead th{background:var(--soft);padding:11px 16px;text-align:left;white-space:nowrap;
 font-family:var(--mono);font-size:11px;font-weight:400;letter-spacing:.6px;text-transform:uppercase;color:#6b6b6b;
 border-bottom:1px solid var(--hair)}
tbody td{padding:13px 16px;vertical-align:top;font-weight:330;line-height:1.5;letter-spacing:-.14px;
 border-bottom:1px solid var(--hair2);font-variant-numeric:tabular-nums}
tbody tr:last-child td{border-bottom:0}
tbody td:first-child{font-weight:540}
blockquote{margin:24px 0;padding:16px 24px;border:0;border-radius:8px;background:var(--pink);
 font-size:16px;font-weight:330;line-height:1.55;letter-spacing:-.14px}
blockquote:before{content:"반드시";display:block;font-family:var(--mono);font-size:11px;letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px}
blockquote p{margin:0}
.qa{border-top:1px solid var(--hair2);padding:16px 0 4px}
.qa:first-of-type{border-top:0;padding-top:0}
.qa p{position:relative;padding-left:28px;margin:0 0 8px}
.qa p:before{position:absolute;left:0;top:.12em;font-family:var(--mono);font-size:11px;letter-spacing:.6px;padding:2px 5px;border-radius:2px}
.qa-q{font-weight:600}
.qa-q:before{content:"Q";background:var(--coral)}
.qa-a{font-weight:320}
.qa-a:before{content:"A";background:var(--soft)}
code{font-family:var(--mono);font-size:13.5px;background:var(--soft);border:1px solid var(--hair2);padding:2px 6px;border-radius:2px;word-break:break-all}
@media print{main{border:0;margin:0;padding:0;max-width:none;border-radius:0}section{break-inside:avoid}}
@media (max-width:600px){main{margin:0;padding:20px 16px;border:0;border-radius:0}h1{font-size:28px}}
</style></head>
<body><main>
<div class="kind">${esc(doc.kind || '업무 매뉴얼')}</div>
<h1>${esc(doc.title || '업무 매뉴얼')}</h1>
<dl>${meta}</dl>
${secs}
</main></body></html>`;
}

export const safeName = (doc: Pick<Manual, 'title'>): string => (doc.title || '업무매뉴얼').replace(/[\\/:*?"<>|]/g, '').slice(0, 60).trim() || '업무매뉴얼';

/** 브라우저 기본 다운로드 */
export function downloadFile(filename: string, data: string, type: string): void {
  const blob = new Blob([data], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

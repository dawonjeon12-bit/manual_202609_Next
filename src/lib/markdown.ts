/* 마크다운 렌더러 — 원본 app.js renderMarkdown() 을 그대로 이식했다.
   출력이 한 글자라도 달라지면 조판이 깨지므로 tests/markdown.test.ts 가
   원본 출력 스냅샷과 비교한다. 고칠 때는 스냅샷도 함께 검토할 것. */

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const splitRow = (s: string) => s.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

export function renderMarkdown(md: string | null | undefined): string {
  const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
  const inline = (t: string) => esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (/^\s*\|/.test(line) && /^[\s|:-]+$/.test(lines[i + 1] || '') && /\|/.test(lines[i + 1] || '')) {
      const head = splitRow(line); i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      out.push('<div class="tablewrap"><table><thead><tr>' +
        head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) { const lvl = Math.min(h[1].length + 1, 4); out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); i++; continue; }

    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote><p>${buf.map(inline).join('<br>')}</p></blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+\[[ xX]\]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+\[[ xX]\]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*[-*]\s+\[[ xX]\]\s+/, '')); i++;
      }
      out.push('<ul class="task">' + buf.map(t => `<li>${inline(t)}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]) && !/^\s*[-*]\s+\[[ xX]\]/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++;
      }
      out.push('<ul>' + buf.map(t => `<li>${inline(t)}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i++; }
      out.push('<ol>' + buf.map(t => `<li>${inline(t)}</li>`).join('') + '</ol>');
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() &&
           !/^\s*([-*]\s|\d+[.)]\s|>|#{2,4}\s|\|)/.test(lines[i])) { buf.push(lines[i]); i++; }

    // 원본과 동일한 무한 루프 방지: 위 어느 블록에도 맞지 않는 줄(예: "-" 한 글자)은
    // 원본에서 buf 가 비어 buf[0].trim() 에서 예외가 난다. 같은 입력을 문단으로 흘려보낸다.
    if (!buf.length) { buf.push(lines[i]); i++; }

    if (/^\*\*\s*Q\s*[.．:]/.test(buf[0].trim())) {
      const q = inline(buf[0].trim().replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, ''));
      const a = buf.slice(1).join('\n').trim().replace(/^A\s*[.．:]\s*/, '');
      out.push(`<div class="qa"><p class="qa-q">${q}</p>` +
        (a ? `<p class="qa-a">${inline(a).replace(/\n/g, '<br>')}</p>` : '') + '</div>');
      continue;
    }
    out.push(`<p>${buf.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

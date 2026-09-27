import { expect, it } from 'vitest';
import { toHTML, toMarkdown } from '@/lib/export';
import fx from './fixtures/export-original.json';

// 원본 app.js toMarkdown() / toHTML() 을 예시 문서로 돌린 결과와 비교
it('toMarkdown 은 원본과 같은 문서를 만든다', () => {
  expect(toMarkdown(fx.doc)).toBe(fx.markdown);
});

it('toHTML 은 원본과 같은 문서를 만든다', () => {
  expect(toHTML(fx.doc)).toBe(fx.html);
});

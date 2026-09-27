import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@/lib/markdown';
import cases from './fixtures/markdown-original.json';

// 원본 app.js renderMarkdown() 의 출력 스냅샷 (scripts/snapshot-original-markdown.mjs 로 생성)
describe('renderMarkdown — 원본과 출력 일치', () => {
  cases.forEach(({ input, output }, i) => {
    it(`case ${i}: ${JSON.stringify(input.slice(0, 30))}`, () => {
      expect(renderMarkdown(input)).toBe(output);
    });
  });
});

describe('renderMarkdown — 원본이 예외로 죽던 입력', () => {
  it('표 구분선 없는 | 로 시작하는 줄을 문단으로 렌더링한다', () => {
    expect(renderMarkdown('| 표 아님')).toBe('<p>| 표 아님</p>');
  });
});

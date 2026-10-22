/* 문서함 — 이 브라우저(localStorage)에만 저장한다. 로그인 없이 쓰는 원본 정적 사이트와 같은 방식.
   다른 기기·다른 브라우저에서는 보이지 않는다. */
import { blankDoc, sampleDoc, uid, type Manual } from './manual';

const KEY = 'modu/manuals/v1';

const byRecent = (a: Manual, b: Manual) => (b.updatedAt || 0) - (a.updatedAt || 0);

export function loadDocs(): Manual[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? (list as Manual[]).sort(byRecent) : [];
  } catch {
    return [];
  }
}

/** 저장했으면 true. 저장 공간이 꽉 찼거나 막혀 있으면 false */
export function saveDocs(docs: Manual[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(docs));
    return true;
  } catch {
    return false;
  }
}

export const newManual = (from = blankDoc()): Manual => ({ ...from, id: uid(), updatedAt: Date.now() });

/** 처음 열면 예시 문서 1건으로 시작한다 */
export function initialDocs(): Manual[] {
  const list = loadDocs();
  if (list.length) return list;
  const seeded = [newManual(sampleDoc())];
  saveDocs(seeded);
  return seeded;
}

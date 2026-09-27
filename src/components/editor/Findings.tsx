'use client';

export interface Finding { severity: string; section: string; issue: string; fix: string }

/** 검수 결과 + 섹션 점프 */
export function Findings({ findings, reviewed, onJump }: {
  findings: Finding[];
  reviewed: boolean;
  onJump: (f: Finding) => void;
}) {
  if (!reviewed) return <div className="findings"><p className="empty-note">아직 검수하지 않았습니다.</p></div>;
  if (!findings.length) return <div className="findings"><p className="empty-note">보완할 점을 찾지 못했습니다.</p></div>;
  return (
    <div className="findings">
      {findings.map((f, i) => {
        const sev = ['높음', '보통', '낮음'].includes(f.severity) ? f.severity : '보통';
        return (
          <div key={i} className="finding" data-sev={sev}>
            <div className="finding-top">
              <span className="sev">{sev}</span>
              <span className="finding-where">{f.section || '전체'}</span>
            </div>
            <p className="finding-issue">{f.issue}</p>
            <p className="finding-fix"><b>고칠 방향</b> · {f.fix}</p>
            {f.section && <button className="btn sm" type="button" onClick={() => onJump(f)}>이 섹션 다듬기</button>}
          </div>
        );
      })}
    </div>
  );
}

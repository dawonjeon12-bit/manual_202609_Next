import type { Metadata } from 'next';
import { Block } from '@/components/Block';
import { Cta, Lead } from '@/components/site';
import { PriceCards } from './PriceCards';

export const metadata: Metadata = {
  title: 'Pricing',
  description: '무료, 팀, 엔터프라이즈 플랜. 문서를 몇 건 만들든 요금은 같습니다.',
};

const ROWS: [string, ...(string | boolean)[]][] = [
  ['문서 수', '3건', '무제한', '무제한'],
  ['목차 설계', true, true, true],
  ['초안 작성', true, true, true],
  ['다듬기 8종', true, true, true],
  ['검수기', false, true, true],
  ['팀 문서함', false, true, true],
  ['공유 템플릿 등록', false, true, true],
  ['조직 권한 관리', false, false, true],
  ['문서 서식 고정', false, false, true],
  ['도입 교육', false, false, true],
];

const FAQS = [
  ['무료 플랜으로 어디까지 되나요', '문서 3건까지 목차 설계, 초안 작성, 다듬기, 내보내기를 모두 쓸 수 있습니다. 검수기와 팀 문서함은 팀 플랜부터입니다.'],
  ['AI 호출 비용은 따로 드나요', '별도로 받지 않습니다. 다만 작성과 검수는 여는 사람의 Claude 사용량으로 동작하며, 첫 호출 때 허용을 한 번 묻습니다.'],
  ['쓴 문서는 어디에 저장되나요', '계정에 저장되고 브라우저에도 사본이 남습니다. 연결이 끊겨도 쓰던 문서를 잃지 않습니다.'],
  ['연간 결제는 얼마나 저렴한가요', '월 12,000원이 10,000원이 됩니다. 1년에 두 달치가 빠지는 셈입니다.'],
  ['도중에 플랜을 내릴 수 있나요', '언제든 내릴 수 있습니다. 문서는 지워지지 않고 무료 플랜 범위를 넘는 문서는 읽기 전용이 됩니다.'],
];

const Cell = ({ v }: { v: string | boolean }) =>
  v === true ? <td><span className="yes" aria-label="포함">✓</span></td>
  : v === false ? <td><span className="no" aria-label="미포함">—</span></td>
  : <td>{v}</td>;

export default function Pricing() {
  return (
    <div className="page">
      <section className="wrap">
        <Lead h1 eyebrow="PRICING" title={<>쓴 만큼이 아니라<br />쓰는 사람만큼.</>}>
          <p className="body-lg">문서를 몇 건 만들든 요금은 같습니다. 먼저 무료로 한 건 만들어 보세요.</p>
        </Lead>
        <PriceCards />
      </section>

      <section className="wrap">
        <Lead eyebrow="COMPARE" title="플랜 비교" />
        <div className="cmp-wrap">
          <table className="cmp">
            <thead><tr><th scope="col">기능</th><th scope="col">무료</th><th scope="col">팀</th><th scope="col">엔터프라이즈</th></tr></thead>
            <tbody>
              {ROWS.map(([name, ...cells]) => (
                <tr key={name}><th scope="row">{name}</th>{cells.map((v, i) => <Cell key={i} v={v} />)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Block bg="lime" wide>
        <Lead wide eyebrow="FAQ" title="자주 묻는 질문" />
        <div className="faq">
          {FAQS.map(([q, a]) => <details key={q}><summary>{q}</summary><div className="faq-a">{a}</div></details>)}
        </div>
      </Block>

      <Cta title="요금을 정하기 전에 한 건 만들어 보세요." sub="무료 플랜으로 충분히 판단할 수 있습니다." />
    </div>
  );
}

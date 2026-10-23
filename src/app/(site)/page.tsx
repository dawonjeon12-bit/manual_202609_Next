import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroDemo } from '@/components/HeroDemo';
import { IconChevrons, IconHandover, IconLayers, IconOps, IconPen, IconRefine, IconShare } from '@/components/Icons';
import { Story } from '@/components/Story';
import editorShot from '../../../public/home/editor.webp';

export const metadata: Metadata = {
  title: { absolute: '모두의 매뉴얼' },
  description: '우리 팀 일하는 법을 누구나 읽히는 매뉴얼로. 인수인계, 업무 공유, 서비스 운영까지 — AI가 알맞은 구성을 잡고, 내용이 늘어날수록 이해하기 쉬운 형태로 다듬습니다.',
};

/* 타깃: 매뉴얼이 필요한 회사원
   목적: 업무 인수인계·공유, 서비스 관리·운영의 편의
   행동 유도: ① 처음 쓸 때 AI가 알맞은 구성 제공 ② 내용이 더해지면 반영해 이해하기 쉬운 형태로
   레이아웃: 히어로 → 종류 띠 → 제품 화면 → 분할 특징(라임) → 공감 캐러셀(크림) → 네이비 띠 → 시연(민트)+단계 → FAQ(라임) → 검정 CTA 카드
   색은 DESIGN-figma.md 규칙 (src/styles/home.css 참고) */

const MANUAL_TYPES = ['업무 인수인계서', '신규 입사자 온보딩', '비용 정산 가이드', '휴가·근태 신청 방법', '주간 보고 작성법',
  '구매·품의 절차', '회의 운영 가이드', '월말 마감 절차', '고객 응대 기준', '협력사 관리 가이드'];

const FAQS: [string, string][] = [
  ['가입이나 설치가 필요한가요?', '필요 없습니다. ‘매뉴얼 바로 만들기’를 누르면 브라우저에서 바로 작업 화면이 열리고, 예시 문서가 하나 들어 있어 빈 화면에서 시작하지 않습니다.'],
  ['쓴 매뉴얼은 어디에 저장되나요?', '지금 쓰는 브라우저에 자동으로 저장됩니다. 다른 기기에서 열거나 팀과 나누려면 Markdown·HTML 파일로 내보내거나 전문을 복사해 사내 위키나 메신저에 붙여 넣으세요.'],
  ['AI가 없는 내용을 지어내지는 않나요?', '담당자 이름, 시스템 이름, 기한, 수치처럼 확인이 필요한 값은 채우지 않고 〈확인 필요〉로 표시합니다. 메모를 덧붙이면 그 자리에 반영합니다.'],
  ['내용이 바뀌면 처음부터 다시 써야 하나요?', '아니요. 섹션을 고르고 바뀐 내용을 직접 지시로 넣으면 기존 흐름에 맞춰 고쳐 씁니다. 길어진 설명은 단계·체크리스트·표로, 어려운 말은 처음 보는 사람 눈높이로 바꿀 수 있습니다.'],
  ['어떤 매뉴얼에 잘 맞나요?', '업무 인수인계서, 신규 입사자 온보딩, 비용 정산·구매 품의 같은 사내 절차, 월말 마감, 고객 응대 기준처럼 회사에서 반복되는 일이라면 직무와 상관없이 대부분 맞습니다. 법적 효력이 필요한 계약서·약관에는 권하지 않습니다.'],
  ['팀이나 회사 단위로 도입하고 싶어요.', '도입 문의를 남겨 주시면 사용 환경에 맞는 구성과 도입 절차를 정리해 1~2 영업일 안에 회신드립니다.'],
];

const More = () => <IconChevrons className="h-chev" />;

export default function Home() {
  return (
    <div className="home">
      {/* 1 · 히어로 (흰 캔버스) + 검정 종류 띠 */}
      <section className="h-hero">
        <div className="wrap h-hero-in">
          <p className="h-pill">AI MANUAL BUILDER FOR TEAMS</p>
          <h1 className="h-hero-title">우리 팀 일하는 법,<br /><span className="hl">누구나 읽히는</span> 매뉴얼로.</h1>
          <p className="h-hero-sub">인수인계, 업무 공유, 서비스 운영까지. 메모를 붙여넣으면 AI가 알맞은 구성을 잡고, 내용이 늘어날수록 이해하기 쉬운 형태로 다듬습니다.</p>
          <div className="h-cta">
            <Link className="h-btn h-btn-primary" href="/editor">매뉴얼 바로 만들기 <More /></Link>
            <Link className="h-btn h-btn-secondary" href="/product">작성 흐름 보기 <More /></Link>
          </div>
          <p className="h-note">가입 없이 · 브라우저에서 바로 · 무료</p>
        </div>
        <div className="h-strip">
          <p className="h-strip-title">이런 매뉴얼을 만듭니다</p>
          <div className="h-strip-track" aria-hidden="true">
            <div className="h-strip-run">{[...MANUAL_TYPES, ...MANUAL_TYPES].map((t, i) => <span key={i}>{t}</span>)}</div>
          </div>
        </div>
      </section>

      {/* 2 · 가운데 제목 + 실제 제품 화면 */}
      <section className="h-sec">
        <div className="wrap">
          <div className="h-lead h-center">
            <h2 className="h-title">메모 한 장이<br /><span className="hl">매뉴얼 한 권</span>이 되는 곳</h2>
            <p className="h-sub">문서함, 문서, AI 작업대가 한 화면에. 브리프를 적는 것부터 다듬고 내보내기까지 화면을 옮기지 않습니다.</p>
          </div>
          <div className="h-shot">
            <Image src={editorShot} alt="모두의 매뉴얼 작업 화면 — 왼쪽 문서함, 가운데 ‘법인카드 비용 정산 매뉴얼’의 정산 기준 표, 오른쪽 AI 작업대의 다듬기 탭"
              sizes="(max-width: 1280px) 100vw, 1184px" placeholder="blur" />
          </div>
        </div>
      </section>

      {/* 3 · 분할 — 큰 제목 + 목적 3가지 */}
      <section className="h-block-sec">
        <div className="wrap"><div className="h-block h-lime h-split">
          <div className="h-lead">
            <p className="h-eyebrow">WHY</p>
            <h2 className="h-title">아는 사람만 아는 일을<br /><span className="hl">모두가 아는 일</span>로.</h2>
            <p className="h-sub">한 사람의 경험에 기대던 일이 문서로 남으면, 그 사람이 없어도 팀이 같은 방식으로 일합니다.</p>
          </div>
          <ul className="h-feats">
            <li>
              <IconHandover className="h-ico" />
              <h3>인수인계</h3>
              <p>담당자가 바뀌어도 구두 설명과 반복 질문 대신 문서 한 장. 넘겨받는 사람이 혼자서도 일을 이어 갑니다.</p>
            </li>
            <li>
              <IconShare className="h-ico" />
              <h3>업무 공유</h3>
              <p>한 사람만 알던 기준을 팀 전체가 봅니다. 사람마다 다르게 처리하던 일이 하나로 맞춰집니다.</p>
            </li>
            <li>
              <IconOps className="h-ico" />
              <h3>서비스 운영</h3>
              <p>반복되는 업무의 절차와 기준이 문서로 남아, 담당자가 바뀌어도 1년에 한 번 하는 일도 같은 순서로 처리합니다.</p>
            </li>
          </ul>
        </div></div>
      </section>

      {/* 4 · 공감 장면 캐러셀 */}
      <Story />

      {/* 5 · 진한 띠 — 두 가지 행동 유도 + 제품 사실 */}
      <section className="h-block-sec">
        <div className="wrap"><div className="h-block h-navy h-dark h-split">
          <div className="h-lead">
            <h2 className="h-title">처음엔 구성을 잡고,<br />쓸수록 <span className="hl">쉬워지는</span> 매뉴얼.</h2>
            <p className="h-sub">빈 템플릿을 주지 않습니다. 적어 준 업무를 읽고 알맞은 뼈대를 먼저 세우고, 내용이 더해질 때마다 누구나 이해하기 쉬운 형태로 다시 다듬습니다.</p>
            <div className="h-cta h-cta-left">
              <Link className="h-btn h-btn-primary" href="/editor">매뉴얼 바로 만들기 <More /></Link>
              <Link className="h-btn h-btn-secondary" href="/contact">도입 문의 <More /></Link>
            </div>
          </div>
          <ul className="h-facts">
            <li>
              <h3>8가지 섹션 서식</h3>
              <p>개요·절차·체크리스트·기준·주의·FAQ·용어·양식. 내용에 맞는 서식으로 처음부터 구성합니다.</p>
            </li>
            <li>
              <h3>8가지 다듬기 + 직접 지시</h3>
              <p>더 짧게, 단계로, 표로, 신입 눈높이로. 새 메모는 직접 지시로 넣으면 기존 흐름에 맞춰 반영합니다.</p>
            </li>
            <li>
              <h3>지어내지 않는 AI</h3>
              <p>담당자·기한·수치처럼 확인이 필요한 값은 〈확인 필요〉로 남겨, 그럴듯한 거짓이 문서에 섞이지 않습니다.</p>
            </li>
          </ul>
        </div></div>
      </section>

      {/* 6 · 가운데 제목 + 시연(왼쪽)·단계 카드(오른쪽) */}
      <section className="h-sec">
        <div className="wrap">
          <div className="h-lead h-center">
            <h2 className="h-title">세 단계면 <span className="hl">충분합니다</span></h2>
            <p className="h-sub">문서 쓰는 게 본업이 아니어도 괜찮습니다. 아는 것을 적기만 하면 형식은 AI가 맞춥니다.</p>
          </div>
          <div className="h-demo-split">
            <div className="h-demo-stage"><HeroDemo /></div>
            <ol className="h-steps">
              <li>
                <IconPen className="h-ico" />
                <div><h3>아는 것을 적습니다</h3><p>어떤 업무인지, 누가 읽을지 적고 메모나 기존 문서, 메신저 대화를 그대로 붙여넣습니다.</p></div>
              </li>
              <li>
                <IconLayers className="h-ico" />
                <div><h3>AI가 구성하고 씁니다</h3><p>순서가 중요한 일은 단계로, 판단이 중요한 일은 기준표로. 업무에 맞는 목차를 세우고 섹션마다 초안을 씁니다.</p></div>
              </li>
              <li>
                <IconRefine className="h-ico" />
                <div><h3>덧붙이며 다듬고 나눕니다</h3><p>새 내용을 넣을 때마다 반영해 더 쉽게 고쳐 쓰고, Markdown·HTML로 내보내 팀과 공유합니다.</p></div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* 7 · FAQ */}
      <section>
        <div className="wrap"><div className="h-block h-lime h-faq-block h-split">
          <div className="h-lead">
            <h2 className="h-title">아직 궁금한 점이<br />남으셨나요?</h2>
            <p className="h-sub">더 알고 싶은 내용은 <Link href="/contact" className="h-inline-link">도입 문의</Link>로 남겨 주세요.</p>
          </div>
          <div className="h-faq">
            {FAQS.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div></div>
      </section>

      {/* 8 · CTA 카드 */}
      <section className="h-final">
        <div className="wrap">
          <div className="h-final-card h-dark">
            <div className="h-final-copy">
              <h2>오늘 아는 것을 적어 두면,<br />내일은 모두가 압니다.</h2>
              <p>메모를 붙여넣고 목차를 받는 데까지 1분이면 충분합니다. 가입 없이 바로 시작하세요.</p>
              <Link className="h-btn h-btn-primary" href="/editor">매뉴얼 바로 만들기 <More /></Link>
            </div>
            <div className="h-final-art" aria-hidden="true">
              <div className="h-note-card" data-c="lilac"><b>절차</b>증빙 등록 → 승인 요청 → 제출</div>
              <div className="h-note-card" data-c="mint"><b>체크리스트</b>☐ 사용 목적 기재<br />☐ 참석자 명단 첨부</div>
              <div className="h-note-card" data-c="lime"><b>+ 메모 반영</b>회식비는 1인 3만 원까지</div>
              <div className="h-note-card" data-c="pink"><b>반드시</b>25일 이후 제출은 다음 달로</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

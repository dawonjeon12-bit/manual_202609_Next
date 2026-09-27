import type { Metadata } from 'next';
import { Eyebrow } from '@/components/site';
import { planLabel } from '@/lib/inquiry';
import { InquiryForm } from './InquiryForm';

export const metadata: Metadata = {
  title: '도입 문의',
  description: '조직 규모와 환경을 알려 주시면 맞는 구성과 도입 절차를 정리해 회신드립니다.',
};

export default async function Contact({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const plan = planLabel((await searchParams).plan);
  const planLine = plan === '팀'
    ? '팀 플랜 도입을 검토 중이시군요. 아래를 남겨 주시면 결제와 초기 설정 안내를 함께 보내드립니다.'
    : '조직 규모와 환경을 알려 주시면, 맞는 구성과 도입 절차를 정리해 회신드립니다.';

  return (
    <div className="page">
      <section className="wrap">
        <div className="lead">
          <Eyebrow>CONTACT</Eyebrow>
          <h1 className="display-xl">도입 문의</h1>
          <p className="body-lg">{planLine}</p>
          <p className="body-sm note-line">보통 1~2 영업일 안에 회신드립니다. 관심 플랜: <b>{plan}</b></p>
        </div>
      </section>

      <section className="wrap">
        <div className="block" data-bg="lime">
          <div className="block-in block-wide">
            <InquiryForm key={plan} plan={plan as '팀' | '엔터프라이즈'} />
          </div>
        </div>
      </section>
    </div>
  );
}

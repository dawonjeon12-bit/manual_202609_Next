import type { Metadata } from 'next';
import Link from 'next/link';
import { Article, LegalPage } from '@/components/Legal';

export const metadata: Metadata = {
  title: '서비스 이용약관',
  description: '모두의 매뉴얼 서비스 이용 조건과 이용자·운영자의 권리와 의무.',
};

const CONTACT = 'dawonjeon12@gmail.com';

export default function Terms() {
  return (
    <LegalPage eyebrow="TERMS" title="서비스 이용약관" effective="2026년 10월 6일"
      intro="이 약관은 모두의 매뉴얼(이하 ‘서비스’)을 이용하는 조건과 절차를 정합니다. 서비스를 이용하면 이 약관에 동의한 것으로 봅니다.">

      <Article n={1} title="서비스 내용">
        <p>서비스는 이용자가 브리프를 바탕으로 업무 매뉴얼의 목차를 설계하고, 본문을 작성·다듬고, 검수하고, 파일로 내보낼 수 있는 웹 도구입니다. 일부 기능은 AI(Anthropic Claude)를 사용합니다.</p>
      </Article>

      <Article n={2} title="문서 보관">
        <ul>
          <li>로그인 없이 이용하며, 작성한 매뉴얼은 이용자의 브라우저에만 저장됩니다.</li>
          <li>브라우저 데이터를 지우거나 다른 기기에서 열면 문서함이 보이지 않습니다. 중요한 문서는 내보내기 기능으로 따로 보관해 주세요. 서비스는 브라우저에서 사라진 문서를 복구할 수 없습니다.</li>
        </ul>
      </Article>

      <Article n={3} title="이용자 콘텐츠">
        <ul>
          <li>이용자가 작성한 매뉴얼과 AI로 생성된 결과물의 권리는 이용자에게 있습니다.</li>
          <li>서비스는 AI 기능 제공에 필요한 범위에서만 이를 처리합니다. 자세한 내용은 <Link href="/privacy">개인정보처리방침</Link>을 따릅니다.</li>
          <li>이용자는 타인의 권리를 침해하거나 법령에 어긋나는 내용을 입력해서는 안 됩니다.</li>
        </ul>
      </Article>

      <Article n={4} title="AI 결과물에 대한 책임">
        <p>AI가 작성한 내용은 사실과 다를 수 있습니다. 서비스는 확인이 필요한 값을 〈확인 필요〉로 표시하도록 설계되어 있지만, 결과물의 정확성을 보증하지 않습니다. 매뉴얼을 실제 업무에 적용하기 전에 반드시 내용을 검토해 주세요. 법적 효력이 필요한 문서(계약서, 약관 등)에는 쓰지 않기를 권합니다.</p>
      </Article>

      <Article n={5} title="금지 행위">
        <ul>
          <li>서비스나 AI 기능을 자동화된 방법으로 과도하게 호출하는 행위</li>
          <li>서비스의 보안을 우회하거나 다른 이용자의 데이터에 접근하려는 행위</li>
          <li>불법적이거나 유해한 콘텐츠를 생성하기 위해 서비스를 이용하는 행위</li>
        </ul>
        <p>위반 시 사전 통지 후 이용을 제한할 수 있습니다. 긴급한 경우 먼저 제한하고 통지할 수 있습니다.</p>
      </Article>

      <Article n={6} title="요금과 사용량">
        <p>현재 서비스는 무료로 제공됩니다. 운영 상황에 따라 AI 기능의 사용량을 제한할 수 있습니다. 유료 플랜이 도입되면 요금과 조건을 <Link href="/pricing">요금 페이지</Link>와 이 약관에 미리 알립니다.</p>
      </Article>

      <Article n={7} title="서비스 변경과 중단">
        <p>서비스는 기능을 바꾸거나 중단할 수 있습니다. 이용자에게 불리한 변경이나 서비스 종료는 30일 전에 알리며, 이용자는 그 전에 작성한 매뉴얼을 내보내기 기능으로 보관할 수 있습니다.</p>
      </Article>

      <Article n={8} title="책임의 한계">
        <p>서비스는 천재지변, 외부 업체(호스팅, AI, 메일)의 장애 등 운영자가 통제할 수 없는 사유로 생긴 손해에 대해 책임지지 않습니다. 다만 운영자의 고의나 중대한 과실로 생긴 손해는 예외로 합니다.</p>
      </Article>

      <Article n={9} title="약관 변경과 문의">
        <p>약관을 바꿀 때는 시행 7일 전(이용자에게 불리한 경우 30일 전)에 이 페이지로 알립니다.</p>
        <p>문의: <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
      </Article>
    </LegalPage>
  );
}

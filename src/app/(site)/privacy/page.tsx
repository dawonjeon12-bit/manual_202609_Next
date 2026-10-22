import type { Metadata } from 'next';
import { Article, LegalPage } from '@/components/Legal';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '모두의 매뉴얼이 수집하는 개인정보와 이용 목적, 보유 기간, 처리 위탁에 대한 안내.',
};

const CONTACT = 'dawonjeon12@gmail.com';

export default function Privacy() {
  return (
    <LegalPage eyebrow="PRIVACY" title="개인정보처리방침" effective="2026년 10월 6일"
      intro="모두의 매뉴얼(이하 ‘서비스’)은 이용자의 개인정보를 필요한 만큼만 수집하고, 아래 목적 외에는 쓰지 않습니다.">

      <Article n={1} title="수집하는 항목과 방법">
        <table className="legal-table">
          <thead><tr><th>구분</th><th>항목</th><th>수집 방법</th></tr></thead>
          <tbody>
            <tr><td>작업 화면</td><td>이용자가 작성한 매뉴얼 내용(제목, 표제부, 브리프, 본문)</td><td>이용자의 브라우저에만 저장. AI 기능을 쓸 때만 해당 내용을 서버를 거쳐 AI 처리 업체로 전달</td></tr>
            <tr><td>도입 문의</td><td>회사·기관명, 이름, 직함, 이메일, 연락처, 문의 응답 내용</td><td>도입 문의 양식에 직접 입력</td></tr>
          </tbody>
        </table>
        <p>서비스는 회원가입이나 로그인을 받지 않습니다. 작성한 매뉴얼은 서버에 저장하지 않습니다.</p>
      </Article>

      <Article n={2} title="이용 목적">
        <ul>
          <li>매뉴얼 작성·내보내기와 AI 작성 기능 제공</li>
          <li>도입 문의 회신과 상담</li>
        </ul>
        <p>광고나 마케팅 목적으로 쓰지 않으며, 이용자의 매뉴얼 내용을 AI 모델 학습에 쓰지 않습니다.</p>
      </Article>

      <Article n={3} title="보유 기간과 파기">
        <ul>
          <li>작성한 매뉴얼: 이용자의 브라우저에 남으며, 이용자가 문서함에서 삭제하거나 브라우저 데이터를 지우면 사라집니다. AI 처리를 위해 전달된 내용은 서비스가 따로 보관하지 않습니다.</li>
          <li>도입 문의: 문의 처리 완료 후 1년. 파기 요청 시 즉시 파기합니다.</li>
        </ul>
        <p>전자적 파일은 복구할 수 없는 방법으로 삭제합니다.</p>
      </Article>

      <Article n={4} title="처리 위탁">
        <p>서비스 운영을 위해 아래 업체에 개인정보 처리를 맡깁니다. 일부 업체는 해외(미국 등)에서 데이터를 처리합니다.</p>
        <table className="legal-table">
          <thead><tr><th>수탁 업체</th><th>위탁 업무</th></tr></thead>
          <tbody>
            <tr><td>Vercel Inc.</td><td>웹사이트 호스팅과 서버 운영</td></tr>
            <tr><td>데이터베이스 호스팅 업체</td><td>도입 문의 내용 저장</td></tr>
            <tr><td>Anthropic PBC</td><td>AI 작성 기능 사용 시 해당 매뉴얼 내용을 전달해 결과 생성</td></tr>
            <tr><td>Resend, Inc.</td><td>도입 문의 내용을 담당자 메일로 발송</td></tr>
          </tbody>
        </table>
        <p>서비스는 위 업체 외의 제3자에게 개인정보를 제공하지 않습니다. 다만 법령에 따라 요구되는 경우는 예외로 합니다.</p>
      </Article>

      <Article n={5} title="이용자의 권리">
        <p>이용자는 언제든 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 작성한 매뉴얼은 작업 화면에서 직접 삭제할 수 있으며, 도입 문의 기록의 삭제는 아래 연락처로 요청해 주세요.</p>
      </Article>

      <Article n={6} title="쿠키와 브라우저 저장소">
        <p>서비스는 로그인이나 추적을 위한 쿠키를 쓰지 않습니다. 작성한 매뉴얼과 화면 설정은 이용자의 브라우저 저장소(localStorage·sessionStorage)에 보관됩니다. 브라우저 데이터를 지우면 문서함도 함께 지워지니, 필요한 문서는 내보내기로 보관해 주세요.</p>
      </Article>

      <Article n={7} title="문의처">
        <p>개인정보 보호 책임자: 모두의 매뉴얼 운영자 · <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
        <p>이 방침이 바뀌면 시행 7일 전에 이 페이지로 알립니다.</p>
      </Article>
    </LegalPage>
  );
}

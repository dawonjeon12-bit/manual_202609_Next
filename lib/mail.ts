import 'server-only';
import { Resend } from 'resend';
import { inquirySubject, inquiryText, type InquiryRecord } from './inquiry';

export const INQUIRY_TO = process.env.INQUIRY_TO || 'dawonjeon12@gmail.com';

/** 담당자에게 문의를 보내고, 문의자에게 접수 확인을 보낸다. 담당자 메일이 나가면 true. */
export async function sendInquiryMail(rec: InquiryRecord): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return false;
  const resend = new Resend(key);

  const toTeam = await resend.emails.send({
    from,
    to: INQUIRY_TO,
    replyTo: rec.email,
    subject: inquirySubject(rec),
    text: inquiryText(rec),
  });
  if (toTeam.error) {
    console.error('[mail] 담당자 발송 실패', rec.id, toTeam.error.message);
    return false;
  }

  // 자동 회신 — 실패해도 접수에는 영향 없음
  const ack = await resend.emails.send({
    from,
    to: rec.email,
    subject: `[모두의 매뉴얼] 도입 문의가 접수되었습니다 · ${rec.id}`,
    text: [
      `${rec.name} 님, 모두의 매뉴얼 도입 문의를 보내 주셔서 감사합니다.`,
      '',
      `문의번호 ${rec.id} 로 접수되었습니다. 보통 1~2 영업일 안에 이 주소로 회신드립니다.`,
      '',
      '— 보내 주신 내용 —',
      inquiryText(rec),
    ].join('\r\n'),
  });
  if (ack.error) console.error('[mail] 자동 회신 실패', rec.id, ack.error.message);
  return true;
}

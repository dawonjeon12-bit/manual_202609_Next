import 'server-only';
import { Resend } from 'resend';
import { esc } from './markdown';
import { inquirySubject, inquiryText, type InquiryRecord } from './inquiry';

/** 도입 문의 수신 주소 */
export const INQUIRY_TO = 'dawonjeon12@gmail.com';

/* 발신 주소 — 도메인 인증 없이 쓸 수 있는 Resend 기본 발신자.
   이 주소로는 Resend 계정 소유자 메일(INQUIRY_TO)에게만 보낼 수 있다.
   도메인을 인증하면 여기를 그 도메인 주소로 바꾼다. */
const FROM = '모두의 매뉴얼 <onboarding@resend.dev>';

/** 메일 본문 HTML — 텍스트 본문을 그대로 고정폭으로 싣는다 */
const inquiryHtml = (rec: InquiryRecord) =>
  `<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#000">` +
  `<p style="margin:0 0 12px;font-size:16px"><b>${esc(rec.company)}</b>에서 도입 문의가 접수되었습니다.</p>` +
  `<pre style="margin:0;padding:16px;background:#f7f7f5;border-radius:8px;font-size:13px;line-height:1.6;white-space:pre-wrap">${esc(inquiryText(rec))}</pre>` +
  `<p style="margin:12px 0 0;font-size:13px;color:#666">이 메일에 회신하면 문의자(${esc(rec.email)})에게 바로 전달됩니다.</p>` +
  `</div>`;

/**
 * 도입 문의를 담당자에게 메일로 보낸다. 보냈으면 true.
 * RESEND_API_KEY 가 없거나 발송에 실패하면 false — 문의는 저장되고,
 * 완료 화면의 ‘메일 앱으로 바로 보내기’(mailto)로 전달할 수 있다.
 */
export async function sendInquiryMail(rec: InquiryRecord): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[mail] RESEND_API_KEY 가 없어 메일을 보내지 않았습니다', rec.id);
    return false;
  }

  const { error } = await new Resend(key).emails.send({
    from: FROM,
    to: INQUIRY_TO,
    replyTo: rec.email,
    subject: inquirySubject(rec),
    text: inquiryText(rec),
    html: inquiryHtml(rec),
  });
  if (error) {
    console.error('[mail] 발송 실패', rec.id, error.name, error.message);
    return false;
  }
  return true;
}

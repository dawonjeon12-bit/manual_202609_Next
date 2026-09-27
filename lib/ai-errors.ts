/* AI 오류 코드 → 한글 메시지. 원본 app.js 의 ERR 맵을 그대로 두고,
   서버 전환으로 생긴 코드(quota_exceeded, unauthorized)를 더했다.
   null = 사용자가 직접 멈춘 것이라 안내하지 않는다. */

export const ERR = {
  not_granted:       'Claude 사용이 허용되지 않았습니다. 페이지를 다시 열고 허용을 눌러주세요.',
  sampling_disabled: '이 계정에서는 Claude를 사용할 수 없습니다.',
  not_declared:      'Claude 기능을 사용할 수 없는 상태입니다.',
  rate_limited:      '요청이 몰렸습니다. 잠시 뒤 다시 시도하세요.',
  session_expired:   '로그인이 만료되었습니다. 다시 로그인한 뒤 시도하세요.',
  prompt_too_large:  '참고 원문이 너무 깁니다. 핵심만 남기고 줄여주세요.',
  refused:           '이 요청으로는 작성할 수 없습니다. 내용을 바꿔 다시 시도하세요.',
  empty_completion:  '답변이 비어 있습니다. 요청을 더 구체적으로 적어주세요.',
  invalid_json:      '결과를 읽지 못했습니다. 한 번 더 시도하세요.',
  upstream_error:    '일시적인 오류가 났습니다. 다시 시도하세요.',
  quota_exceeded:    '이번 달 AI 사용 한도를 모두 썼습니다. 요금 페이지에서 플랜을 확인하세요.',
  bad_request:       '요청 내용을 읽지 못했습니다. 페이지를 새로 고친 뒤 다시 시도하세요.',
  cancelled:         null,
} as const;

export type AiErrorCode = keyof typeof ERR;

export const isAiErrorCode = (c: unknown): c is AiErrorCode =>
  typeof c === 'string' && Object.prototype.hasOwnProperty.call(ERR, c);

/** 스트리밍 응답에서 본문과 오류 코드를 가르는 구분자. 본문 뒤에 붙는다. */
export const STREAM_ERROR_MARK = '\u0000';

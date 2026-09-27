export const json = (data: unknown, status = 200) => Response.json(data, { status });

export const unauthorized = () => json({ error: 'session_expired' }, 401);
export const notFound = () => json({ error: 'not_found' }, 404);
export const badRequest = (error = 'bad_request') => json({ error }, 400);

/** 본문을 JSON 으로 읽는다. 깨진 본문이면 undefined */
export async function readJson(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { return undefined; }
}

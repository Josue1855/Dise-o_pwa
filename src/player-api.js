export class ApiError extends Error {
  constructor(code, status = 0, requestId = null) { super(code); this.code = code; this.status = status; this.requestId = requestId; }
}
export function validateName(value) {
  const name = value.trim().normalize('NFC');
  return name.length >= 1 && name.length <= 40 && /^[\p{L}\p{M}\p{N} _.'-]+$/u.test(name) ? name : null;
}
export function isPlayer(p) {
  return p && typeof p.id === 'string' && /^[0-9a-f-]{36}$/i.test(p.id) && typeof p.displayName === 'string' && typeof p.createdAt === 'string' && Number.isFinite(Date.parse(p.createdAt));
}
export async function api(method, name, fetcher = fetch) {
  const start = performance.now();
  let response;
  try {
    response = await fetcher('/api/players?limit=100&offset=0', {
      method, cache: 'no-store', signal: AbortSignal.timeout(8000),
      ...(method === 'POST' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: name }) } : {})
    });
  } catch { console.warn(`event=players_http method=${method} status=network_error`); throw new ApiError('NETWORK_UNCERTAIN'); }
  const requestId = response.headers.get('X-Request-Id');
  console.info(`event=players_http method=${method} status=${response.status} durationMs=${(performance.now()-start).toFixed(3)} requestId=${requestId ?? 'none'}`);
  let payload;
  try { payload = await response.json(); } catch { throw new ApiError('INVALID_RESPONSE', response.status, requestId); }
  if (!response.ok) throw new ApiError(payload.code ?? 'HTTP_ERROR', response.status, requestId);
  if ((method === 'POST' && (response.status !== 201 || !isPlayer(payload))) ||
      (method === 'GET' && (!Array.isArray(payload.items) || !payload.items.every(isPlayer)))) throw new ApiError('INVALID_RESPONSE', response.status, requestId);
  return { data: payload, requestId, status: response.status };
}

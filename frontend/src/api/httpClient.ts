export class HttpError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authToken?: string | null;
  signal?: AbortSignal;
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export async function requestJson<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`);
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    headers,
    signal: options.signal,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  const payload =
    contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `HTTP ${response.status}`;

    throw new HttpError(message, response.status, payload);
  }

  return payload as TResponse;
}

import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, method, ...rest } = options;
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }

    const message =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'error' in errorBody &&
      typeof (errorBody as { error: unknown }).error === 'string'
        ? (errorBody as { error: string }).error
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, errorBody);
  }

  // Sostituisci le ultime righe con questo:
  if (response.status === 204) {
    return undefined as T;
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
}

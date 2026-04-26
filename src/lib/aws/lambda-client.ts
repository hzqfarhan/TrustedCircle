const API_GATEWAY_BASE = process.env.API_GATEWAY_URL ||
  'https://hjqu25msbk.execute-api.ap-southeast-1.amazonaws.com/v1';

export function isLambdaEnabled(): boolean {
  return !!process.env.API_GATEWAY_URL;
}

export async function invokeLambda<T = unknown>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<T> {
  const url = `${API_GATEWAY_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Lambda ${method} ${path} failed (${res.status}): ${errorText}`);
  }
  return res.json() as Promise<T>;
}

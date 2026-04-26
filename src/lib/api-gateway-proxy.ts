/**
 * Lightweight proxy to AWS API Gateway.
 * Forwards Next.js API route requests to the Lambda-powered REST API.
 */

const GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  'https://hjqu25msbk.execute-api.ap-southeast-1.amazonaws.com/v1';

export async function proxyToGateway(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${GATEWAY_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(
      `[proxyToGateway] ${options?.method ?? 'GET'} ${path} → ${res.status}`,
      body.slice(0, 500)
    );
  }

  return res;
}

/** Convenience: proxy + extract JSON */
export async function proxyJson<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await proxyToGateway(path, options);
  return res.json();
}

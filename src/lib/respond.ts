// Tiny JSON response helpers shared by the API routes.

export function json(data: unknown, sMaxAgeSeconds = 0): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };
  if (sMaxAgeSeconds > 0) {
    headers['Cache-Control'] = `public, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=86400`;
    headers['Netlify-CDN-Cache-Control'] = `public, durable, s-maxage=${sMaxAgeSeconds}`;
  }
  return new Response(JSON.stringify(data), { status: 200, headers });
}

export function fail(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

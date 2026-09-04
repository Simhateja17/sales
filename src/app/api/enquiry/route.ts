// Receives the public marketing forms. The free-lead preview is handed to the
// backend's asynchronous lead-sourcing workflow so the public page never receives
// provider credentials.
//
// The design export discarded the submission — the handler only flipped a
// "submitted" flag — so anyone filling it in was silently lost. This runs
// server-side so the destination address never appears in the page source.

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

type Kind = 'free-leads';

const FIELDS: Record<Kind, readonly string[]> = {
  'free-leads': ['company', 'product', 'titles', 'industry', 'region', 'companySize', 'email'],
};

const clean = (value: unknown) =>
  typeof value === 'string' ? value.trim().slice(0, 500) : '';

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const kind = payload.kind as Kind;
  if (kind !== 'free-leads') {
    return Response.json({ ok: false, error: 'Unknown form.' }, { status: 400 });
  }

  const fields = Object.fromEntries(
    FIELDS[kind].map((key) => [key, clean(payload[key])]),
  );

  if (!fields.email || !fields.email.includes('@')) {
    return Response.json({ ok: false, error: 'A valid email is required.' }, { status: 400 });
  }

  if (!BACKEND_API_URL) {
    console.error('[enquiry] BACKEND_API_URL is not set — free lead preview not queued');
    return Response.json({ ok: false, error: 'Could not start the preview right now.' }, { status: 503 });
  }

  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const res = await fetch(`${BACKEND_API_URL.replace(/\/$/, '')}/api/free-lead-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      },
      cache: 'no-store',
      body: JSON.stringify(fields),
    });
    const responsePayload = await res.json().catch(() => ({ ok: false, error: 'Could not start the preview right now.' }));
    return Response.json(responsePayload, { status: res.status });
  } catch (error) {
    console.error('[enquiry] free lead preview forwarding failed', error);
    return Response.json({ ok: false, error: 'Could not start the preview right now.' }, { status: 502 });
  }
}

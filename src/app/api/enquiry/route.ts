// Receives the public marketing forms (waitlist + "3 free leads") and forwards
// them to email.
//
// The design export discarded both submissions — the handlers only flipped a
// "submitted" flag — so anyone filling them in was silently lost. This runs
// server-side so the destination address never appears in the page source.
//
// FormSubmit needs no account: the first message to a new address triggers a
// one-time confirmation email that must be clicked before delivery starts.
//
// The destination lives in FORWARD_TO rather than in this file — the repository
// is public, and a plain address in source gets scraped. Set it in .env.local
// for development and in the hosting provider's environment for production.

const FORWARD_TO = process.env.FORWARD_TO;
const ENDPOINT = process.env.FORM_ENDPOINT
  || (FORWARD_TO ? `https://formsubmit.co/ajax/${FORWARD_TO}` : null);

type Kind = 'waitlist' | 'free-leads';

const FIELDS: Record<Kind, readonly string[]> = {
  'waitlist': ['name', 'email', 'company'],
  'free-leads': ['company', 'industry', 'icp', 'email'],
};

const SUBJECTS: Record<Kind, string> = {
  'waitlist': 'CircleOn — new waitlist signup',
  'free-leads': 'CircleOn — 3 free leads request',
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
  if (kind !== 'waitlist' && kind !== 'free-leads') {
    return Response.json({ ok: false, error: 'Unknown form.' }, { status: 400 });
  }

  const fields = Object.fromEntries(
    FIELDS[kind].map((key) => [key, clean(payload[key])]),
  );

  if (!fields.email || !fields.email.includes('@')) {
    return Response.json({ ok: false, error: 'A valid email is required.' }, { status: 400 });
  }

  if (!ENDPOINT) {
    // Log the submission rather than dropping it, so nothing is lost if the
    // variable is missing in a deployment.
    console.error('[enquiry] FORWARD_TO is not set — submission not delivered:', kind, fields);
    return Response.json({ ok: false, error: 'Could not send right now.' }, { status: 500 });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...fields,
        _subject: SUBJECTS[kind],
        _template: 'table',
        _captcha: 'false',
      }),
    });

    if (!res.ok) {
      // Log the payload so a delivery outage does not lose the enquiry.
      console.error('[enquiry] forwarding failed', res.status, kind, fields);
      return Response.json({ ok: false, error: 'Could not send right now.' }, { status: 502 });
    }
  } catch (error) {
    console.error('[enquiry] forwarding threw', error, kind, fields);
    return Response.json({ ok: false, error: 'Could not send right now.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}

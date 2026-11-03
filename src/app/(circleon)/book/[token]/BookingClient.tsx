'use client';
import { useEffect, useMemo, useState } from 'react';
import { bookMeeting, getBookingPage, type BookingPageData, type BookingSlot } from '@/lib/api';
import { formatScheduledTime } from '../../dashboard/_lib/scheduleTime';

const inZone = (timeZone: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-SG', { timeZone, ...options });

export default function BookingClient({ token }: { token: string }) {
  const [page, setPage] = useState<BookingPageData | null>(null);
  const [selected, setSelected] = useState<BookingSlot | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [bookedAt, setBookedAt] = useState('');
  const [loaded, setLoaded] = useState(false);

  function load() {
    return getBookingPage(token)
      .then(setPage)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load open times.'))
      .finally(() => setLoaded(true));
  }

  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => {
    if (!page) return [];
    const label = inZone(page.timezone, { weekday: 'long', day: 'numeric', month: 'long' });
    const groups = new Map<string, BookingSlot[]>();
    for (const slot of page.slots) {
      const key = label.format(new Date(slot.start));
      groups.set(key, [...(groups.get(key) || []), slot]);
    }
    return [...groups.entries()];
  }, [page]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const result = await bookMeeting(token, { start: selected.start, name: name.trim(), email: email.trim() });
      setBookedAt(result.start);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete the booking.');
      setSelected(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const timezone = page?.timezone || 'Asia/Singapore';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '48px 20px' }}>
      <section className="card" style={{ width: 'min(560px, 100%)', alignSelf: 'flex-start', padding: 28 }}>
        {bookedAt ? (
          <>
            <div className="card-title">You&apos;re booked in</div>
            <p className="sf-hint" style={{ marginTop: 10, fontSize: 14 }}>{formatScheduledTime(bookedAt, timezone)}. {page?.company} will confirm the details by email.</p>
          </>
        ) : !loaded ? (
          <p className="sf-hint">Loading open times…</p>
        ) : !page ? (
          <>
            <div className="card-title">This link isn&apos;t working</div>
            <p role="alert" className="sf-hint" style={{ marginTop: 10, fontSize: 14 }}>{error}</p>
          </>
        ) : (
          <>
            <div className="card-title">Book a meeting with {page.company}</div>
            <p className="sf-hint" style={{ marginTop: 6 }}>{page.slot_minutes} minutes. Times are shown in {timezone.split('/').pop()?.replace(/_/g, ' ')} time.</p>
            {error ? <p role="alert" className="sf-hint" style={{ color: '#b42318', marginTop: 12 }}>{error}</p> : null}
            {!days.length ? <p className="sf-hint" style={{ marginTop: 16 }}>No times are open right now. Please check back soon.</p> : null}
            {days.map(([day, slots]) => (
              <div key={day} style={{ marginTop: 18 }}>
                <div className="mb-field">{day}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {slots.map(slot => (
                    <button key={slot.start} type="button" className={selected?.start === slot.start ? 'btn-primary' : 'btn-outline'} aria-pressed={selected?.start === slot.start} onClick={() => setSelected(slot)}>
                      {inZone(timezone, { hour: 'numeric', minute: '2-digit' }).format(new Date(slot.start))}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {selected ? (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 24 }}>
                <p className="sf-hint" style={{ margin: 0 }}>{formatScheduledTime(selected.start, timezone)}</p>
                <label className="mb-field">Your name<input className="sf-inp" value={name} onChange={event => setName(event.target.value)} autoComplete="name" maxLength={120} required /></label>
                <label className="mb-field">Your email<input className="sf-inp" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" maxLength={254} required /></label>
                <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Booking…' : 'Confirm booking'}</button>
              </form>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

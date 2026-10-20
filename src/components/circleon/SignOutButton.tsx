'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api';

// Pages before the dashboard have no sidebar, so this gives them a way out
// for someone who signed up with the wrong email.
export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await logout().catch(() => undefined);
    router.replace('/login');
  }

  return (
    <button type="button" className="co-signout" onClick={signOut} disabled={busy}>
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}

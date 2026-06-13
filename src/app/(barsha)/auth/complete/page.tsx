'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkspace } from '@/lib/api';

export default function AuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    getWorkspace()
      .then(state => {
        if (!state.workspace.plan) {
          router.replace('/plan-select');
        } else if (!state.workspace.onboarding_completed) {
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      })
      .catch(error => {
        const message = error instanceof Error ? error.message : 'Could not complete sign in.';
        setError(message);
        setTimeout(() => router.replace('/login'), 1200);
      });
  }, [router]);

  return (
    <div className="screen active" id="auth-complete">
      <div className="start-card" style={{ maxWidth: 560 }}>
        <div className="start-top">
          <div className="start-kicker"><span className="ob-cat-dot" />Authentication</div>
          <div className="start-title">Finishing sign in</div>
          <p className="start-sub">
            {error || 'Checking your workspace and sending you to the right place.'}
          </p>
        </div>
      </div>
    </div>
  );
}

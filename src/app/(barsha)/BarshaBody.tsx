'use client';
import { useEffect } from 'react';

export function BarshaBody() {
  useEffect(() => {
    document.body.classList.add('barsha-active');
    return () => document.body.classList.remove('barsha-active');
  }, []);
  return null;
}

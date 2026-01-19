'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a redirect path stored from 404.html
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      router.replace(redirectPath);
    }
  }, [router]);

  return null;
}

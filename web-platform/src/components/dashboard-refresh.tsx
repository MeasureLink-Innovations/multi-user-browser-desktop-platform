'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Poll every 10 seconds to refresh the dashboard status
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return null; // This component doesn't render anything
}

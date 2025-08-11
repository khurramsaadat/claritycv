"use client";

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly component that ensures children only render on client-side
 * This prevents SSR issues with browser-specific libraries and hydration mismatches
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to ensure this runs after hydration
    const timeoutId = setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // During SSR and initial client render, show fallback
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  // After hydration, show children
  return <>{children}</>;
}

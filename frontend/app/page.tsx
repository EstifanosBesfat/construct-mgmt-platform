'use client';

import * as React from 'react';
import { LandingPage } from '@/components/landing/landing-page';

export default function RootPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0E131F]" />}>
      <LandingPage />
    </React.Suspense>
  );
}

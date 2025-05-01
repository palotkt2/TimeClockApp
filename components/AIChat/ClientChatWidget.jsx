'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AIChat with SSR disabled to avoid hydration issues
const AIChatWidget = dynamic(() => import('./AIChat'), {
  ssr: false,
  loading: () => null,
});

export default function ClientChatWidget() {
  return <AIChatWidget />;
}

import 'loui-ds/styles.css';
import { DSProvider, ToastRegion } from 'loui-ds';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Loui DS: Next.js example' };

// Server Component: imports the design system directly, no wrapper with 'use client'.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DSProvider locale="en-US">
          {children}
          <ToastRegion />
        </DSProvider>
      </body>
    </html>
  );
}

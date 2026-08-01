import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crestline Capital — Wealth Management Without Limits',
  description: 'Modern digital banking and wealth management platform. FDIC insured, 256-bit encryption, 24/7 support.',
  keywords: 'banking, wealth management, digital banking, investment, savings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

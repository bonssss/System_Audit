import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'AI Project Scanner - Enterprise Code Security Platform',
  description: 'AI-powered project scanner and code security platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen flex antialiased">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { SidebarProvider } from '@/lib/sidebar-context';

export const metadata: Metadata = {
  title: 'System Audit - Enterprise Code Security Platform',
  description: 'AI-powered project scanner and system auditing security platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ai_scanner_theme_preference');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'light' || (!theme && !supportDarkMode)) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground min-h-screen flex antialiased selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black">
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <Sidebar />
              <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent">
                {children}
              </main>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* Statcounter Code */}
        <Script id="statcounter-config" strategy="afterInteractive">
          {`
            var sc_project=13353564; 
            var sc_invisible=1; 
            var sc_security="d1397a02"; 
          `}
        </Script>
        <Script
          src="https://www.statcounter.com/counter/counter.js"
          strategy="afterInteractive"
        />
        <noscript>
          <div className="statcounter">
            <a
              title="Web Analytics Made Easy - Statcounter"
              href="https://statcounter.com/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="statcounter"
                src="https://c.statcounter.com/13353564/0/d1397a02/1/"
                alt="Web Analytics Made Easy - Statcounter"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </noscript>
      </body>
    </html>
  );
}

import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Post-It - Social Media Management',
  description: 'Manage your social media accounts and business profiles in one place',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#5170ff" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-full">
              {children}
            </main>
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

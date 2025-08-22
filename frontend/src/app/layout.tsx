import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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

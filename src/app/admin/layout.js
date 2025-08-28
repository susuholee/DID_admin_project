'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();

 const hideLayout =
    pathname === '/admin' || pathname === '/admin/signup';

  return (
    <html lang="ko">
      <body>
        {hideLayout ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

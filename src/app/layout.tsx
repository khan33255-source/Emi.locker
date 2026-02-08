import type {Metadata, Viewport} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Emi.locker | Enterprise Mobile Finance Security',
  description: 'The premier MDM and EMI management solution for mobile retailers. Secure hardware assets with remote locking, Kiosk Mode, and persistent device control.',
  keywords: ['Emi locker', 'MDM', 'Mobile Finance', 'Remote Lock', 'Etawah Mobile Security'],
  openGraph: {
    title: 'Emi.locker | Secure Your Assets',
    description: 'Protect your hardware investments with professional EMI management.',
    url: 'https://emilocker-a9f98.web.app',
    siteName: 'Emi.locker',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1632910110458-435eb54b8d9a',
        width: 1200,
        height: 630,
        alt: 'Emi.locker Dashboard',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Emi.locker',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-accent/30">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

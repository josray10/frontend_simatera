import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/utils/AuthContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Dashboard Simatera',
  description: 'Sistem Informasi Asrama Mahasiswa ITERA',
  manifest: '/manifest.json',
icons: {
    // Path ikon ini benar karena file ada di public/icons/
    icon: '/icons/simatera-192x192.png',
    shortcut: ['/icons/simatera-192x192.png'],
    apple: '/icons/simatera-192x192.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
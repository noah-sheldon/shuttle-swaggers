import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/global/Navbar';
import { Footer } from '@/components/global/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shuttle Swaggers Badminton Club',
  description: 'Advanced/High Intermediate badminton club in Watford. Join our sessions at Watford Central Leisure Centre and Fuller Health Life Centre.',
  keywords: 'badminton, Watford, shuttle swaggers, advanced, intermediate, club, sports',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
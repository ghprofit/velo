import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from './redux';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Velo Link - Login',
  description: 'Login to manage your platform with confidence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
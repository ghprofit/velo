import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import StoreProvider from './redux';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/components/ui/Toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'VeloLink',
  description: 'Login to manage your platform with confidence',
  icons: {
    icon: [
      { url: "/assets/logo_svgs/brand-icon-black.svg", type: "image/svg+xml" },
      { url: "/assets/logo_images/Brand_icon(white).png", type: "image/png" },
    ],
    shortcut: "/assets/logo_images/Brand_icon(white).png",
    apple: "/assets/logo_images/Brand_icon(white).png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <ToastProvider>
          <AuthProvider>
            <StoreProvider>{children}</StoreProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
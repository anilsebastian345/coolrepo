import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sage AI Coach",
  description: "Your personalized AI career coaching assistant",
  metadataBase: new URL('https://sage-aicoach.vercel.app'),
  openGraph: {
    title: "Sage AI Coach",
    description: "Your personalized AI career coaching assistant",
    url: 'https://sage-aicoach.vercel.app',
    siteName: 'Sage AI Coach',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage AI Coach',
    description: 'Your personalized AI career coaching assistant',
  },
  icons: {
    icon: [
      {
        url: '/sage-favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
    ],
    apple: {
      url: '/sage-favicon.svg',
      type: 'image/svg+xml',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

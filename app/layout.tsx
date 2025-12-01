import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sage - Career Intelligence",
  description: "Career intelligence for the next chapter",
  metadataBase: new URL('https://sage-aicoach.vercel.app'),
  openGraph: {
    title: "Sage - Career Intelligence",
    description: "Career intelligence for the next chapter",
    url: 'https://sage-aicoach.vercel.app',
    siteName: 'Sage',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage - Career Intelligence',
    description: 'Career intelligence for the next chapter',
  },
  // Icons are automatically handled by app/icon.svg
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Prayer: Jesus, Mary, Joseph help me and help the user
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

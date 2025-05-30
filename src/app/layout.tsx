import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIDBOARD - The Internet's Most Expensive Leaderboard",
  description:
    "Pay to flex. Claim your spot on the internet's most expensive leaderboard. The more you pay, the higher you rank.",
  keywords: ["leaderboard", "pay to win", "internet fame", "flex", "bidding"],
  authors: [{ name: "BIDBOARD" }],
  openGraph: {
    title: "BIDBOARD - Pay to Flex",
    description:
      "The internet's most expensive leaderboard. How much would you pay to be #1?",
    type: "website",
    locale: "en_US",
    siteName: "BIDBOARD",
  },
  twitter: {
    card: "summary_large_image",
    title: "BIDBOARD - Pay to Flex",
    description:
      "The internet's most expensive leaderboard. How much would you pay to be #1?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

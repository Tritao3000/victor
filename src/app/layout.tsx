import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Victor - On-Demand Home Services",
    template: "%s",
  },
  description:
    "Connect with verified plumbing and electrical professionals. Book in minutes, get it fixed today.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://victor.pt",
  ),
  openGraph: {
    type: "website",
    siteName: "Victor",
    title: "Victor - On-Demand Home Services",
    description:
      "Connect with verified plumbing and electrical professionals. Book in minutes, get it fixed today.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Victor - On-Demand Home Services",
    description:
      "Connect with verified plumbing and electrical professionals. Book in minutes, get it fixed today.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coin Listing Card Maker — Tangerine",
  description: "Generate on-brand coin listing announcement images for Tangerine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

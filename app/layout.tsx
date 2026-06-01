import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CF AutoBooks | AI bookkeeping for Australian businesses",
  description:
    "CF AutoBooks by Carmichael Financials extracts invoice and receipt data, GST and categories for Australian small businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}

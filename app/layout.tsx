import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecoverFlow | AI revenue recovery for service businesses",
  description:
    "RecoverFlow helps service businesses follow up unpaid invoices, unanswered quotes, stale leads and repeat service opportunities.",
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

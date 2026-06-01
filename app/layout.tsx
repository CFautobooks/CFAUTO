import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CallBack AI | Missed-call AI follow-up for small businesses",
  description:
    "CallBack AI turns missed calls into customers with instant SMS follow-up, AI lead capture and owner summaries.",
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

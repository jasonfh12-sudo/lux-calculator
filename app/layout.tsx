import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lux Voice Minutes Calculator",
  description: "Calculate your voice AI costs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

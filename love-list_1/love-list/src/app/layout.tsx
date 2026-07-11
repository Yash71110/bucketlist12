import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Us — our bucket list",
  description: "A shared bucket list & memory scrapbook, just for us.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

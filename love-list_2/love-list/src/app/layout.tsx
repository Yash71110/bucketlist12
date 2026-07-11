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
      <head>
        <script
          // Runs before hydration so the correct theme applies on first
          // paint instead of flashing light-then-dark (or vice versa).
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('love-list-theme');
                if (t === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

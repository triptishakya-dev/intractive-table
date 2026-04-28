import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rubenius AI | Interactive Trend Explorer",
  description:
    "Explore Rubenius experiential design trends with an AI-powered HeyGen avatar. Discover awards, REDS framework pillars, and insights through an interactive conversation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

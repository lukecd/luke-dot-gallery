import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://luke.gallery"),
  title: "Luke Cassady-Dorion | Developer, designer, maker",
  description: "Apps, tools, explanations, music, and occasionally films.",
  openGraph: {
    title: "Luke Cassady-Dorion | Developer, designer, maker",
    description: "I make things for people... with computers.",
    images: [{ url: "/og.png", width: 1732, height: 908 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luke Cassady-Dorion | Developer, designer, maker",
    description: "I make things for people... with computers.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

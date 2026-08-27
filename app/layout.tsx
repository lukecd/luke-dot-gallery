import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://luke.gallery"),
  title: "Luke Cassady-Dorion | Apps, tools, technical explanations, and films",
  description: "Luke Cassady-Dorion builds apps, tools, technical explanations, and films.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Luke Cassady-Dorion | Apps, tools, technical explanations, and films",
    description: "Luke Cassady-Dorion builds apps, tools, technical explanations, and films.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1732,
        height: 908,
        alt: "Luke Cassady-Dorion's portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luke Cassady-Dorion | Apps, tools, technical explanations, and films",
    description: "Luke Cassady-Dorion builds apps, tools, technical explanations, and films.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon-zinnia-mark.svg",
    shortcut: "/favicon-zinnia-mark.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://luke.gallery/#luke-cassady-dorion",
      name: "Luke Cassady-Dorion",
      url: "https://luke.gallery",
      description: "Luke Cassady-Dorion builds apps, tools, technical explanations, and films.",
      sameAs: ["https://github.com/lukecd"],
    },
    {
      "@type": "WebSite",
      "@id": "https://luke.gallery/#website",
      name: "Luke Cassady-Dorion",
      url: "https://luke.gallery",
      description: "A portfolio of apps, tools, technical explanations, and films.",
      creator: { "@id": "https://luke.gallery/#luke-cassady-dorion" },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

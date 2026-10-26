import type { Metadata } from "next";
import { Barlow_Condensed, DM_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_MEASUREMENT_ID } from "./lib/analytics";

const title = "Luke — Personal Transmission";
const description = "Apps, tech guides, music, and films by Luke Cassady-Dorion.";
const shareImage = {
  url: "/assets/social/liftoff-card.jpg",
  width: 1200,
  height: 630,
  alt: "Luke — apps, tech guides, music, and films. A paper rocket lifts off into a navy sky.",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://luke.gallery"),
  title,
  description,
  openGraph: {
    type: "website",
    url: "https://luke.gallery/",
    siteName: "Luke.gallery",
    title,
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${dmMono.variable}`}>
      <body>
        {children}
        {isProduction && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="lazyOnload" />
            <Script id="google-analytics" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

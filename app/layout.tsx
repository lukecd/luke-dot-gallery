import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GA_MEASUREMENT_ID } from "./lib/analytics";

export const metadata: Metadata = {
  title: "Luke — Personal Transmission",
  description: "A personal transmission from Luke.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="en">
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

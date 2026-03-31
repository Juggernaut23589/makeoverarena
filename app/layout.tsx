import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: {
    default: "MakeoverArena — Study Abroad Consultancy",
    template: "%s | MakeoverArena",
  },
  description:
    "Nigeria's premier study-abroad consultancy. We help ambitious students gain admission to top universities in the US, UK, Canada, Australia, and Europe.",
  keywords: [
    "study abroad Nigeria",
    "university admission consultancy",
    "scholarship assistance",
    "US UK Canada Australia university",
    "student visa support",
  ],
  authors: [{ name: "MakeoverArena" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://makeoverarena.com",
    siteName: "MakeoverArena",
    title: "MakeoverArena — Study Abroad Consultancy",
    description:
      "Nigeria's premier study-abroad consultancy helping students achieve their dream of studying at top universities worldwide.",
    images: [
      {
        url: "https://makeoverarena.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MakeoverArena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MakeoverArena — Study Abroad Consultancy",
    description:
      "Nigeria's premier study-abroad consultancy helping students achieve their dream of studying at top universities worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-cream dark:bg-navy-950">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster richColors position="top-right" />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}

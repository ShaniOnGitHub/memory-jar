import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://memory-jar.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Memory Jar | Your Digital Journal",
  description:
    "A nostalgic, airy journal to collect your daily memories, moods, and moments. Preserve your story, one day at a time.",
  keywords: ["journal", "diary", "memories", "mood tracker", "personal"],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Memory Jar",
    title: "Memory Jar | Your Digital Journal",
    description:
      "A nostalgic, airy journal to collect your daily memories, moods, and moments. Preserve your story, one day at a time.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Memory Jar — Your Digital Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Jar | Your Digital Journal",
    description:
      "A nostalgic, airy journal to collect your daily memories, moods, and moments. Preserve your story, one day at a time.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

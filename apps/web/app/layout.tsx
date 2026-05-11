import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://anythingapi.com"),
  title: {
    default: "API for Anything — Turn any website into a callable API",
    template: "%s · API for Anything",
  },
  description:
    "Describe a task in plain English. Our AI builds the automation. You get a production-ready REST API returning structured JSON. Open source, self-hostable, MCP-native.",
  keywords: [
    "web scraping",
    "browser automation",
    "AI agent",
    "playwright",
    "MCP",
    "claude desktop",
    "cursor",
    "open source scraping",
    "notte alternative",
    "browserbase alternative",
  ],
  authors: [{ name: "API for Anything" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anythingapi.com",
    siteName: "API for Anything",
    title: "API for Anything — Turn any website into a callable API",
    description:
      "Describe a task in plain English. Our AI builds the automation. You get a production-ready REST API returning structured JSON.",
  },
  twitter: {
    card: "summary_large_image",
    title: "API for Anything — Turn any website into a callable API",
    description:
      "Describe in plain English. AI builds it. You get JSON. Open source.",
    creator: "@anythingapi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

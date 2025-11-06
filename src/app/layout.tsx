import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dasbor IoT Kantor Desa Pondokrejo",
  description: "Sistem monitoring real-time sensor dan perangkat IoT Kantor Desa Pondokrejo",
  keywords: ["IoT", "Kantor Desa", "Monitoring", "Sensor", "Pondokrejo", "Next.js", "TypeScript"],
  authors: [{ name: "Kantor Desa Pondokrejo" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Dasbor IoT Kantor Desa Pondokrejo",
    description: "Sistem monitoring real-time sensor dan perangkat IoT",
    url: "http://localhost:3000",
    siteName: "IoT Kantor Desa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dasbor IoT Kantor Desa Pondokrejo",
    description: "Sistem monitoring real-time sensor dan perangkat IoT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

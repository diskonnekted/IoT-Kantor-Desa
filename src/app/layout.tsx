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
<<<<<<< HEAD
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
=======
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
>>>>>>> 18d71b6fff2c80103a08fce6b57db679dd6e2290
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
<<<<<<< HEAD
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
=======
    title: "Dasbor IoT Kantor Desa Pondokrejo",
    description: "Sistem monitoring real-time sensor dan perangkat IoT",
>>>>>>> 18d71b6fff2c80103a08fce6b57db679dd6e2290
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

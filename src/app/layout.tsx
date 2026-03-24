import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { AuthSessionProvider } from "@/components/session-provider";
import { AuthGuard } from "@/components/auth-guard";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Pick - 블로그 & 쓰레드 자동 생성",
  description:
    "레퍼런스 블로그 글의 구조를 분석하고, 동일한 스타일로 새로운 블로그 글을 자동 생성합니다.",
  openGraph: {
    title: "Blog Pick - 블로그 & 쓰레드 자동 생성",
    description:
      "레퍼런스 블로그 글의 구조를 분석하고, 동일한 스타일로 새로운 블로그 글을 자동 생성합니다.",
    siteName: "Blog Pick",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <MotionProvider>
              <AuthGuard>
                <div className="min-h-screen bg-background">
                  <Header />
                  <main>{children}</main>
                </div>
              </AuthGuard>
            </MotionProvider>
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

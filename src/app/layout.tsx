import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLAW:FE SPOT",
  description: "CLAW:FE SPOT — Where teams and agents meet to get things done.",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <OnboardingProvider>
            <AppShell>{children}</AppShell>
          </OnboardingProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

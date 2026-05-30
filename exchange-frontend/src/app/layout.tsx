import "./globals.css";
import type { Metadata } from "next";
import AppHeader from "@/components/layout/AppHeader";
import AuthBootstrap from "@/components/layout/AuthBootstrap";
import ToastViewport from "@/components/layout/ToastViewport";

export const metadata: Metadata = {
  title: "ExchangeX",
  description: "Realtime crypto exchange frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthBootstrap />
        <AppHeader />
        <ToastViewport />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
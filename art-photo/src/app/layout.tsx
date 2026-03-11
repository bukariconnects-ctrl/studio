import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Art Photo Studio",
    template: "%s | Art Photo Studio",
  },
  description: "استوديو تصوير احترافي - حجز جلسات تصوير، متجر معدات، وخدمات تصوير متميزة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${outfit.variable} ${plusJakarta.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors dir="rtl" />
        </AuthProvider>
      </body>
    </html>
  );
}

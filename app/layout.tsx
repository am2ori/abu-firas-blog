import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
// ... code continues ... (wait, I should not replace the metadata block if I can avoid it)

export const metadata: Metadata = {
  title: "وميض الكتابة | مدونة أبو فراس",
  description: "مدونة شخصية للمهندس والكاتب عبدالعظيم أبو فراس",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`antialiased bg-stone-50 text-stone-900 font-sans ${ibmPlexSansArabic.variable}`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


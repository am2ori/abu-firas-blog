import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans-arabic";
import "./globals.css";

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
      <body className="antialiased bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

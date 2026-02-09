import type { Metadata } from 'next';
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomeContent from "@/components/home-content";

// SEO Metadata — rendered server-side for search engines
export const metadata: Metadata = {
  title: 'وميض الكتابة — مدونة عبدالعظيم أبو فراس',
  description: 'أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني، أسافر أحياناً وأُدوّن عن نثريات السفر وفرائده.',
  openGraph: {
    title: 'وميض الكتابة — مدونة عبدالعظيم أبو فراس',
    description: 'أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني.',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'وميض الكتابة',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وميض الكتابة — مدونة عبدالعظيم أبو فراس',
    description: 'أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

// Server Component — this shell renders instantly (great for LCP/FCP)
// Dynamic content loads client-side via HomeContent
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50">
      <Header />

      <main className="flex-1">
        <HomeContent />
      </main>

      <Footer />
    </div>
  );
}

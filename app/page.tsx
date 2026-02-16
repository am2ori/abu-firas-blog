import type { Metadata } from 'next';
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomeContent from "@/components/home-content";
import { getHomeSettings } from '@/lib/settings';
import { db, serializeData } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Post, Category } from '@/types';

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
// Server Component — fetches data securely on the server
export default async function Home() {
  // 1. Fetch all data in parallel for best performance
  const [settingsData, categoriesData, postsData] = await Promise.all([
    getHomeSettings(),
    getDocs(collection(db, 'categories')),
    getDocs(query(
      collection(db, 'posts'),
      where('published', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(12)
    ))
  ]);

  // 2. Process Categories
  const categories = categoriesData.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Category[];

  // 3. Process Posts
  const latestPosts = postsData.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[];

  // 4. Extract Tags (Server-side)
  const tagsSet = new Set<string>();
  latestPosts.forEach(p => p.tags?.forEach(t => tagsSet.add(t)));
  const allTags = Array.from(tagsSet);

  // 5. Serialize Data (Convert Timestamps to plain objects)
  const serializedSettings = serializeData(settingsData);
  const serializedCategories = serializeData(categories);
  const serializedPosts = serializeData(latestPosts);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50">
      <Header />

      <main className="flex-1">
        <HomeContent
          homeSettings={serializedSettings}
          categories={serializedCategories}
          latestPosts={serializedPosts}
          allTags={allTags}
        />
      </main>

      <Footer />
    </div>
  );
}

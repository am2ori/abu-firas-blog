'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Category } from '@/types';
import BlogPostCard from "@/components/blog-post-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { FolderOpen } from 'lucide-react';
import SearchBar from "@/components/search-bar";
import TagsWidget from "@/components/tags-widget";

export default function Home() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Categories
        const catsRef = collection(db, 'categories');
        const catsSnapshot = await getDocs(catsRef);
        const catsResult = catsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(catsResult);

        // 2. Fetch Latest 12 Published Posts (Global)
        const postsRef = collection(db, 'posts');
        const postsQuery = query(
          postsRef,
          where('published', '==', true),
          orderBy('publishedAt', 'desc'),
          limit(12)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setLatestPosts(posts);

        // 3. Extract Tags (Client-side simple extraction from fetched posts)
        const tags = new Set<string>();
        posts.forEach(p => p.tags?.forEach(t => tags.add(t)));
        setAllTags(Array.from(tags));

      } catch (error: any) {
        console.error("Error fetching home data:", error);
        setError(`حدث خطأ أثناء تحميل البيانات: ${error.message || 'خطأ غير معروف'}`);
        if (error.message?.includes('index')) {
          setError('⚠️ يحتاج هذا القسم إلى "فهرس" (Index) في Firebase ليعمل. افتح الكونسول (F12) واضغط على الرابط لإنشائه.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-stone-50/50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="bg-red-50 text-red-800 p-8 rounded-xl border border-red-200 text-center max-w-lg">
            <h2 className="text-xl font-bold mb-4">عذراً، حدث خطأ 😔</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
            <div className="mt-6 text-xs text-red-600/70 text-left ltr bg-white/50 p-2 rounded">
              Developer Note: Check console for full error details.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50/50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">

        {/* Hero Section (Restored) */}
        <section className="mb-12 text-center bg-white p-12 rounded-3xl border border-stone-200 shadow-sm">
          <h1 className="text-4xl font-bold text-stone-900 mb-6">أهلاً، أنا عبدالعظيم أبو فراس 👋</h1>
          <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
            &quot;أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني، أسافر أحياناً وأُدوّن عن نثريات السفر وفرائده.&quot;
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar (Right Column in RTL) */}
          <aside className="lg:col-span-1 space-y-8 h-fit lg:sticky lg:top-24 order-last lg:order-first"> {/* Mobile: Sidebar Last, Desktop: Sidebar First (Right) */}

            {/* Search Widget */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">
                بحث
              </h3>
              <Suspense fallback={<div className="h-10 bg-stone-100 rounded-lg animate-pulse" />}>
                <SearchBar />
              </Suspense>
            </div>

            {/* Categories Widget */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                <FolderOpen size={18} className="text-amber-600" />
                التصنيفات
              </h3>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-1/2" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link
                        href={`/blog/category/${cat.id}`}
                        className="flex items-center justify-between text-stone-600 hover:text-amber-800 hover:bg-stone-50 px-2 py-1.5 rounded transition-colors text-sm group"
                      >
                        <span>{cat.name}</span>
                        <span className="text-stone-300 text-xs group-hover:text-amber-600 transition-colors">&larr;</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tags Widget */}
            <TagsWidget tags={allTags} />

          </aside>

          {/* Main Content (List of Articles) */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-stone-800 relative inline-block">
                أحدث المقالات
                <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-amber-500 rounded-full"></span>
              </h2>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-white rounded-xl border border-stone-100 animate-pulse" />
                ))}
              </div>
            ) : latestPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {latestPosts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    categoryName={categories.find(c => c.id === post.categoryId)?.name}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
                <p className="text-stone-500">لا توجد مقالات منشورة حتى الآن.</p>
              </div>
            )}

            {latestPosts.length > 0 && (
              <div className="mt-12 text-center">
                <Link
                  href="/blog"
                  className="inline-block px-8 py-3 bg-white border border-stone-300 text-stone-700 font-medium rounded-full hover:bg-stone-50 hover:border-stone-400 transition-all shadow-sm"
                >
                  تصفح جميع المقالات
                </Link>
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

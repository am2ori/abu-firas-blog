'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Category } from '@/types';
import { getHomeSettings, HomeSettings } from '@/lib/settings';
import BlogPostCard from "@/components/blog-post-card";
import { FolderOpen } from 'lucide-react';
import SearchBar from "@/components/search-bar";
import TagsWidget from "@/components/tags-widget";

export default function HomeContent() {
    const [latestPosts, setLatestPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                // 0. Fetch Home Settings
                const settings = await getHomeSettings();
                setHomeSettings(settings);

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

            } catch (error: unknown) {
                console.error("Error fetching home data:", error);
                const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
                setError(`حدث خطأ أثناء تحميل البيانات: ${errorMessage}`);
                if (errorMessage.includes('index')) {
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
            <div className="container mx-auto px-4 py-12 flex items-center justify-center">
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
            </div>
        );
    }

    return (
        <>
            {/* Enhanced Hero Section - Dynamic */}
            {homeSettings?.homeVisibility?.showHero !== false && (
                <section className="relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-stone-100/30" />
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d97706\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                    }} />

                    <div className="relative container mx-auto px-4 py-16 md:py-24 max-w-6xl">
                        <div className="text-center max-w-4xl mx-auto">
                            {/* Greeting with enhanced typography */}
                            <div className="animate-fade-in-up">
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
                                    👋 مرحباً بك في مدونتي
                                </span>
                                <h1 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6 leading-tight">
                                    {homeSettings?.heroContent?.heroTitle || 'أنا <span className="text-amber-600">عبدالعظيم أبو فراس</span>'}
                                </h1>
                                <div className="text-xl md:text-2xl text-stone-700 leading-relaxed mb-8 max-w-3xl mx-auto">
                                    <blockquote className="border-r-4 border-amber-400 pr-6 pl-4">
                                        &quot;{homeSettings?.heroContent?.heroSubtitle || 'أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني، أسافر أحياناً وأُدوّن عن نثريات السفر وفرائده.'}&quot;
                                    </blockquote>
                                </div>
                                {homeSettings?.heroContent?.ctaButton?.text && (
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        <Link
                                            href={homeSettings.heroContent.ctaButton.url || '/blog'}
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-200"
                                        >
                                            {homeSettings.heroContent.ctaButton.text}
                                            <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Content Section */}
            <section className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar (Enhanced) */}
                    <aside className="lg:col-span-1 space-y-6 h-fit lg:sticky lg:top-24 order-last lg:order-first">
                        {/* Search Widget */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-subtle">
                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                بحث في المقالات
                            </h3>
                            <Suspense fallback={<div className="h-10 bg-stone-100 rounded-lg skeleton" />}>
                                <SearchBar />
                            </Suspense>
                        </div>

                        {/* Categories Widget */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-subtle">
                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <FolderOpen size={18} className="text-amber-600" />
                                التصنيفات
                            </h3>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-4 bg-stone-100 rounded skeleton" />
                                    ))}
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {categories.map(cat => (
                                        <li key={cat.id}>
                                            <Link
                                                href={`/blog/category/${cat.id}`}
                                                className="flex items-center justify-between text-stone-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm group"
                                            >
                                                <span className="font-medium">{cat.name}</span>
                                                <svg className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Tags Widget */}
                        <TagsWidget tags={allTags} />
                    </aside>

                    {/* Main Content */}
                    <section className="lg:col-span-3">
                        {homeSettings?.homeVisibility?.showLatestPostsSection !== false && (
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-stone-900 mb-2">أحدث المقالات</h2>
                                    <p className="text-stone-600">آخر ما نشرته في رحلة المعرفة</p>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-xl border border-stone-200 p-6">
                                        <div className="h-4 bg-stone-100 rounded skeleton mb-4 w-3/4" />
                                        <div className="h-3 bg-stone-100 rounded skeleton mb-2" />
                                        <div className="h-3 bg-stone-100 rounded skeleton mb-2 w-5/6" />
                                        <div className="h-3 bg-stone-100 rounded skeleton w-4/6" />
                                    </div>
                                ))}
                            </div>
                        ) : latestPosts.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {latestPosts.map((post, index) => (
                                    <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                        <BlogPostCard
                                            post={post}
                                            categoryName={categories.find(c => c.id === post.categoryId)?.name}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-stone-800 mb-2">لا توجد مقالات منشورة</h3>
                                <p className="text-stone-600 mb-6">سأقوم بنشر أول مقال قريباً. تابعونا!</p>
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                                >
                                    تصفح الأرشيف
                                </Link>
                            </div>
                        )}

                        {latestPosts.length > 0 && (
                            <div className="mt-12 text-center">
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-200"
                                >
                                    تصفح جميع المقالات
                                    <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </>
    );
}

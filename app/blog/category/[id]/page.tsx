'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Category } from '@/types';
import BlogPostCard from "@/components/blog-post-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
    const params = useParams();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!categoryId) return;

            try {
                // 1. Fetch Category Details
                const catRef = doc(db, 'categories', categoryId);
                const catSnap = await getDoc(catRef);

                if (catSnap.exists()) {
                    setCategory({ id: catSnap.id, ...catSnap.data() } as Category);
                }

                // 2. Fetch Posts in this Category
                const postsRef = collection(db, 'posts');
                const q = query(
                    postsRef,
                    where('published', '==', true),
                    where('categoryId', '==', categoryId),
                    orderBy('publishedAt', 'desc')
                );

                const postsSnap = await getDocs(q);
                const fetchedPosts = postsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                setPosts(fetchedPosts);

            } catch (error) {
                console.error("Error fetching category data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [categoryId]);

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-stone-500 hover:text-amber-900 mb-6 transition-colors text-sm">
                        <ArrowLeft size={16} className="ml-1" />
                        عودة للرئيسية
                    </Link>

                    {loading ? (
                        <div className="h-8 w-48 bg-stone-100 rounded animate-pulse" />
                    ) : category ? (
                        <div>
                            <span className="text-amber-600 font-bold tracking-wide text-sm uppercase mb-2 block">تصنيف</span>
                            <h1 className="text-4xl font-bold text-stone-900 mb-4">{category.name}</h1>
                            {category.description && (
                                <p className="text-xl text-stone-600 max-w-2xl">{category.description}</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-stone-500">التصنيف غير موجود</div>
                    )}
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-stone-50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {posts.map((post) => (
                            <BlogPostCard
                                key={post.id}
                                post={post}
                                categoryName={category?.name}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-stone-50 rounded-xl p-12 text-center text-stone-500 border border-dashed border-stone-200">
                        لا توجد مقالات في هذا التصنيف بعد.
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

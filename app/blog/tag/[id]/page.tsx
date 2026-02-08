'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Tag } from '@/types';
import BlogPostCard from "@/components/blog-post-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Pagination from '@/components/pagination';

const POSTS_PER_PAGE = 8;

export default function TagPage() {
    const params = useParams();
    const tagSlug = params.id as string;
    
    const [tag, setTag] = useState<Tag | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function fetchData() {
            if (!tagSlug) return;

            try {
                // 1. Fetch Tag Details
                const tagRef = doc(db, 'tags', tagSlug);
                const tagSnap = await getDoc(tagRef);
                
                if (tagSnap.exists()) {
                    setTag({ id: tagSnap.id, ...tagSnap.data() } as Tag);
                }

                // 2. Fetch Posts with this tag
                const postsRef = collection(db, 'posts');
                const q = query(
                    postsRef,
                    where("published", "==", true),
                    where("tags", "array-contains", tagSnap.data()?.name || tagSlug),
                    orderBy("publishedAt", "desc"),
                    limit(POSTS_PER_PAGE)
                );

                const postsSnap = await getDocs(q);
                const fetchedPosts = postsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                // 3. Get total count for pagination
                const countQuery = query(
                    postsRef,
                    where("published", "==", true),
                    where("tags", "array-contains", tagSnap.data()?.name || tagSlug)
                );
                const countSnap = await getDocs(countQuery);
                
                setPosts(fetchedPosts);
                setTotalPosts(countSnap.docs.length);
                setTotalPages(Math.ceil(countSnap.docs.length / POSTS_PER_PAGE));

            } catch (error) {
                console.error("Error fetching tag data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [tagSlug, currentPage]);

    useEffect(() => {
        // Update URL when page changes
        if (currentPage > 1 && tagSlug) {
            const newUrl = `/blog/tag/${tagSlug}?page=${currentPage}`;
            window.history.replaceState({}, '', newUrl);
        }
    }, [currentPage, tagSlug]);

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
                        <div className="h-8 w-48 bg-stone-100 rounded-lg animate-pulse" />
                    ) : tag ? (
                        <div>
                            <span className="text-amber-600 font-bold tracking-wide text-sm uppercase mb-2 block">الوسم</span>
                            <h1 className="text-4xl font-bold text-stone-900 mb-4">{tag.name}</h1>
                        </div>
                    ) : (
                        <div className="text-stone-500">الوسم غير موجود</div>
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
                                categoryName={tag?.name || undefined} // Use tag name as category if available
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500">
                        لا توجد مقالات في هذا الوسم.
                    </div>
                )}

                {/* Pagination */}
                {!loading && posts.length > 0 && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={`/blog/tag/${tagSlug || ''}`}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}
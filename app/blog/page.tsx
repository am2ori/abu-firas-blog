import { Suspense } from 'react';
import BlogPostCard from "@/components/blog-post-card";
import SearchBar from "@/components/search-bar";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Post, Category } from "@/types";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getPosts() {
    try {
        const postsRef = collection(db, "posts");
        // Fetch only published posts, ordered by publishedAt date descending
        const q = query(
            postsRef,
            where("published", "==", true),
            orderBy("publishedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Post[];
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

// Fetch Categories
async function getCategories() {
    try {
        const catsRef = collection(db, "categories");
        const snapshot = await getDocs(catsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string }> }) {
    const { q, tag } = await searchParams;
    const postsResult = getPosts();
    const categoriesResult = getCategories();

    // Parallel fetch
    const [allPosts, categories] = await Promise.all([postsResult, categoriesResult]);

    // Filter posts
    let displayedPosts = allPosts;

    if (q) {
        const queryLower = q.toLowerCase();
        displayedPosts = displayedPosts.filter(post =>
            post.title?.toLowerCase().includes(queryLower) ||
            post.seo_description?.toLowerCase().includes(queryLower) ||
            post.tags?.some(tag => tag.toLowerCase().includes(queryLower))
        );
    }

    if (tag) {
        displayedPosts = displayedPosts.filter(post =>
            post.tags?.includes(decodeURIComponent(tag))
        );
    }

    // Dynamic Title
    let pageTitle = "جميع المقالات";
    if (tag) pageTitle = `الوسم: ${decodeURIComponent(tag)}`;
    if (q) pageTitle = `نتائج البحث: ${q}`;

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <h1 className="text-3xl font-bold text-stone-900">{pageTitle}</h1>
                    <Suspense fallback={<div className="w-full max-w-md h-12 bg-stone-100 rounded-lg animate-pulse" />}>
                        <SearchBar />
                    </Suspense>
                </div>

                {displayedPosts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {displayedPosts.map((post) => (
                            <BlogPostCard
                                key={post.id}
                                post={post}
                                categoryName={categories.find(c => c.id === post.categoryId)?.name}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500">
                        لا توجد مقالات تطابق بحثك.
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

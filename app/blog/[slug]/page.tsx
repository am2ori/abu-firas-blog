import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MarkdownViewer from "@/components/markdown-viewer";
import ShareButtons from "@/components/share-buttons";
import SuggestedPosts from "@/components/suggested-posts";
import { Post } from "@/types";

import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Fetch post from Firestore by slug
// Fetch post from Firestore by slug or ID
async function getPost(rawSlugOrId: string): Promise<Post | null> {
    // Decode the slug to handle Arabic characters correctly
    const slugOrId = decodeURIComponent(rawSlugOrId);


    try {
        const postsRef = collection(db, "posts");

        // 1. Try finding by slug
        const q = query(postsRef, where("slug", "==", slugOrId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as Post;
        }

        // 2. Fallback: Try finding by Document ID
        // Only try this if the string looks like a potential ID (alphanumeric check is optional but safer)

        const docRef = doc(db, "posts", slugOrId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Post;
        }


        return null;
    } catch (error) {
        console.error("[getPost] Error fetching post:", error);
        return null;
    }
}

// Fetch suggested posts based on tags or category
async function getSuggestedPosts(currentPost: Post): Promise<Post[]> {
    try {
        const postsRef = collection(db, "posts");

        // Try to find posts with similar tags first
        if (currentPost.tags && currentPost.tags.length > 0) {
            const tagQueries = currentPost.tags.map(tag =>
                query(postsRef, where("tags", "array-contains", tag), where("published", "==", true), limit(5))
            );

            const snapshots = await Promise.all(tagQueries.map(q => getDocs(q)));
            const allPosts: Post[] = [];

            snapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    const post = { id: doc.id, ...doc.data() } as Post;
                    if (post.id !== currentPost.id) {
                        allPosts.push(post);
                    }
                });
            });

            // Remove duplicates and limit to 4 posts
            const uniquePosts = allPosts.filter((post, index, self) =>
                index === self.findIndex(p => p.id === post.id)
            );

            if (uniquePosts.length >= 2) {
                return uniquePosts.slice(0, 4);
            }
        }

        // Fallback: Get posts from same category
        const categoryQuery = query(
            postsRef,
            where("categoryId", "==", currentPost.categoryId),
            where("published", "==", true),
            limit(6)
        );
        const categorySnapshot = await getDocs(categoryQuery);

        const categoryPosts = categorySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Post))
            .filter(post => post.id !== currentPost.id);

        return categoryPosts.slice(0, 4);
    } catch (error) {
        console.error("[getSuggestedPosts] Error:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return {};

    return {
        title: post.seo_title || post.title,
        description: post.seo_description,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    // Get suggested posts
    const suggestedPosts = await getSuggestedPosts(post);

    // Build the full URL for sharing
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.abufiras.com';
    const fullUrl = `${baseUrl}/blog/${post.slug}`;

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <header className="mb-8 border-b border-stone-100 pb-8">
                    <div className="flex gap-2 text-sm text-stone-500 mb-4">
                        <span>{new Date(post.publishedAt!.seconds * 1000).toLocaleDateString("ar-EG")}</span>
                        <span>•</span>
                        <span className="text-amber-800 font-medium">السفر والترحال</span>
                    </div>
                    <h1 className="text-4xl font-bold text-stone-900 leading-tight mb-4">{post.title}</h1>
                </header>

                {/* Cover Image Inside Post */}
                {post.featuredImageUrl && (
                    <div className="relative mb-8 rounded-lg overflow-hidden shadow-lg h-96">
                        <Image
                            src={post.featuredImageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 768px"
                            priority
                        />
                    </div>
                )}

                <MarkdownViewer content={post.contentMarkdown} />

                <div className="mt-12 pt-8 border-t border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-3">الوسوم:</h3>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Share Section - moved to end of article */}
                <div className="mt-8 pt-6 border-t border-stone-100">
                    <ShareButtons url={fullUrl} title={post.title} />
                </div>

                {/* Suggested Posts */}
                <SuggestedPosts suggestedPosts={suggestedPosts} />
            </main>

            <Footer />
        </div>
    );
}

import { notFound } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MarkdownViewer from "@/components/markdown-viewer";
import { Post } from "@/types";

import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Fetch post from Firestore by slug
// Fetch post from Firestore by slug or ID
async function getPost(rawSlugOrId: string): Promise<Post | null> {
    // Decode the slug to handle Arabic characters correctly
    const slugOrId = decodeURIComponent(rawSlugOrId);
    console.log(`[getPost] Fetching for: ${slugOrId} (Raw: ${rawSlugOrId})`);

    try {
        const postsRef = collection(db, "posts");

        // 1. Try finding by slug
        const q = query(postsRef, where("slug", "==", slugOrId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log(`[getPost] Found by slug: ${slugOrId}`);
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as Post;
        }

        // 2. Fallback: Try finding by Document ID
        // Only try this if the string looks like a potential ID (alphanumeric check is optional but safer)
        console.log(`[getPost] Slug not found, trying as ID: ${slugOrId}`);
        const docRef = doc(db, "posts", slugOrId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log(`[getPost] Found by ID: ${slugOrId}`);
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Post;
        }

        console.log(`[getPost] Not found by Slug or ID: ${slugOrId}`);
        return null;
    } catch (error) {
        console.error("[getPost] Error fetching post:", error);
        return null;
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

                <MarkdownViewer content={post.contentMarkdown} />

                <div className="mt-12 pt-8 border-t border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-3">الوسوم:</h3>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">#{tag}</span>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

import { Post, Category } from "@/types";
import { collection, getDocs, getCountFromServer, orderBy, query, where, limit as limitFn, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Updated to support proper pagination with cursor-based pagination
export async function getPosts(page = 1, limit = 12, startAfterDoc?: QueryDocumentSnapshot) {
    try {
        const postsRef = collection(db, "posts");
        
        // Build the query
        let q = query(
            postsRef,
            where("published", "==", true),
            orderBy("publishedAt", "desc"),
            limitFn(limit)
        );
        
        // Add cursor for pagination (not for first page)
        if (startAfterDoc && page > 1) {
            q = query(q, startAfter(startAfterDoc));
        }
        
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Post[];
        
        return {
            posts,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
            hasMore: snapshot.docs.length === limit
        };
    } catch (error) {
        console.error("Error fetching posts:", error);
        return {
            posts: [],
            lastDoc: null,
            hasMore: false
        };
    }
}

// Get total count for pagination using more efficient getCountFromServer
export async function getTotalPosts() {
    try {
        const postsRef = collection(db, "posts");
        const q = query(
            postsRef,
            where("published", "==", true)
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting total posts:", error);
        return 0;
    }
}

// Search posts with optimized query
export async function searchPosts(searchQuery: string, page = 1, limit = 12) {
    try {
        const postsRef = collection(db, "posts");
        const q = query(
            postsRef,
            where("published", "==", true),
            orderBy("publishedAt", "desc"),
            limitFn(limit * 3) // Fetch more to allow client-side filtering
        );
        
        const snapshot = await getDocs(q);
        let posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Post[];
        
        // Client-side search filtering
        if (searchQuery) {
            const queryLower = searchQuery.toLowerCase();
            posts = posts.filter(post =>
                post.title?.toLowerCase().includes(queryLower) ||
                post.seo_description?.toLowerCase().includes(queryLower) ||
                post.tags?.some(tag => tag.toLowerCase().includes(queryLower))
            );
        }
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedPosts = posts.slice(startIndex, startIndex + limit);
        
        return {
            posts: paginatedPosts,
            total: posts.length,
            hasMore: startIndex + limit < posts.length
        };
    } catch (error) {
        console.error("Error searching posts:", error);
        return {
            posts: [],
            total: 0,
            hasMore: false
        };
    }
}

// Fetch Categories
export async function getCategories(): Promise<Category[]> {
    try {
        const catsRef = collection(db, 'categories');
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
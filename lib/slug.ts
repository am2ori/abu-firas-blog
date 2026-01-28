import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export function generateSlug(text: string): string {
    if (!text) return '';

    let slug = text.trim();

    // Remove Arabic diacritics (Tashkeel)
    slug = slug.replace(/[\u064B-\u065F\u0670]/g, '');

    // Lowercase (useful for English mixed content)
    slug = slug.toLowerCase();

    // Replace spaces with dashes
    slug = slug.replace(/\s+/g, '-');

    // Remove special characters, keeping:
    // - Arabic letters (\u0621-\u064A)
    // - English letters (a-z)
    // - Numbers (0-9)
    // - Hyphens (-)
    slug = slug.replace(/[^a-z0-9\-\u0621-\u064A]/g, '');

    // Remove multiple dashes
    slug = slug.replace(/-+/g, '-');

    // Trim dashes from start/end
    slug = slug.replace(/^-+|-+$/g, '');

    return slug;
}

/**
 * Checks if a slug already exists in a collection.
 * Excludes the current document ID if provided (for edits).
 */
export async function checkSlugUnique(
    collectionName: string,
    slug: string,
    excludeId?: string
): Promise<boolean> {
    try {
        const q = query(
            collection(db, collectionName),
            where("slug", "==", slug)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return true;

        // If we found duplicates, check if it's the same document we are editing
        if (excludeId) {
            const isSameDoc = snapshot.docs.length === 1 && snapshot.docs[0].id === excludeId;
            return isSameDoc;
        }

        return false;
    } catch (error) {
        console.error("Error checking slug uniqueness:", error);
        // Fail safe: assume unique to avoid blocking user if network error, or careful? 
        // Better to let other error handlers catch network issues. 
        // Returning true might cause duplication, returning false blocks.
        // Let's rethrow or return false.
        return false;
    }
}

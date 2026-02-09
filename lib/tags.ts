import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy,
    where,
    limit,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Tag } from "@/types";

const COLLECTION_NAME = "tags";

// Get all tags
export async function getTags(): Promise<Tag[]> {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Tag));
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
}

// Get single tag
export async function getTag(id: string): Promise<Tag | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Tag;
        }
        return null;
    } catch (error) {
        console.error("Error fetching tag:", error);
        return null;
    }
}

// Add new tag
export async function addTag(data: Partial<Tag>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding tag:", error);
        throw error;
    }
}

// Update tag
export async function updateTag(id: string, data: Partial<Tag>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating tag:", error);
        throw error;
    }
}

// Delete tag
export async function deleteTag(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting tag:", error);
        throw error;
    }
}

// Get or create tag by name — uses direct Firestore query (not fetching all tags)
export async function getOrCreateTag(name: string): Promise<Tag> {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error('Tag name cannot be empty');
    }

    try {
        // Direct query instead of fetching ALL tags
        const q = query(
            collection(db, COLLECTION_NAME),
            where("name", "==", trimmedName),
            limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const existingDoc = snapshot.docs[0];
            return { id: existingDoc.id, ...existingDoc.data() } as Tag;
        }

        // Create new tag
        const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-\u0600-\u06FF]/g, '');
        const tagId = await addTag({
            name: trimmedName,
            slug: slug
        });

        return {
            id: tagId,
            name: trimmedName,
            slug: slug
        };
    } catch (error) {
        console.error("Error in getOrCreateTag:", error);
        throw error;
    }
}
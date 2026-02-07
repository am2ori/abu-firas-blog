import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy
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
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
}

// Update tag
export async function updateTag(id: string, data: Partial<Tag>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

// Delete tag
export async function deleteTag(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Get or create tag by name
export async function getOrCreateTag(name: string): Promise<Tag> {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error('Tag name cannot be empty');
    }

    // Try to find existing tag
    const tags = await getTags();
    const existingTag = tags.find(tag => 
        tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTag) {
        return existingTag;
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
}
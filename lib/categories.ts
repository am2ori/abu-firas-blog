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
    Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Category } from "@/types";

const COLLECTION_NAME = "categories";

// Get all categories
export async function getCategories(): Promise<Category[]> {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Category));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Get single category
export async function getCategory(id: string): Promise<Category | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Category;
        }
        return null;
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
}

// Add new category
export async function addCategory(data: Partial<Category>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

// Update category
export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

// Delete category
export async function deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

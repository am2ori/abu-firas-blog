import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore — using default WebSocket transport for best performance
let db: Firestore;
try {
    db = initializeFirestore(app, {});
} catch (e) {
    db = getFirestore(app);
}

// Helper to serialize Firestore data (convert Timestamps to plain objects)
export function serializeData<T>(data: T): T {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(serializeData) as unknown as T;
    }

    if (typeof data === 'object' && data !== null) {
        // Handle Firestore Timestamp
        if ('seconds' in data && 'nanoseconds' in data && Object.keys(data).length === 2) {
            return {
                seconds: (data as any).seconds,
                nanoseconds: (data as any).nanoseconds,
            } as unknown as T;
        }

        // Handle nested objects
        const serialized: any = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeData(value);
        }
        return serialized as T;
    }

    return data;
}

export { app, auth, db };

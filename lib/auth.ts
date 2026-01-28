import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    User
} from "firebase/auth";
import { auth } from "./firebase";

export async function login(email: string, password: string): Promise<User> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}

export async function logout(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
}

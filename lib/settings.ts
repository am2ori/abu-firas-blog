import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    FieldValue
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Shared timestamp type for Firestore documents
type FirestoreTimestamp = Timestamp | FieldValue | null;

// Home/Profile Settings Types
export interface HomeSettings {
    authorInfo: {
        name: string;
        photo?: string;
        bio: string;
        role: string;
    };
    homeVisibility: {
        showHero: boolean;
        showLatestPostsSection: boolean;
    };
    heroContent: {
        heroTitle: string;
        heroSubtitle: string;
        ctaButton?: {
            text: string;
            url: string;
        };
    };
    socialLinks?: {
        twitter?: string;
        facebook?: string;
        linkedin?: string;
        github?: string;
    };
    updatedAt: FirestoreTimestamp;
    createdAt: FirestoreTimestamp;
}

// Appearance Settings Types
export interface AppearanceSettings {
    primaryColor: string;
    secondaryColor?: string;
    postsPerPage: number;
    updatedAt: FirestoreTimestamp;
    createdAt: FirestoreTimestamp;
}

export interface AccountSettings {
    name: string;
    email: string;
    updatedAt: FirestoreTimestamp;
    createdAt: FirestoreTimestamp;
}

export interface SystemSettings {
    siteTitle: string;
    siteDescription: string;
    contactEmail: string;
    notificationEmail?: string;
    updatedAt: FirestoreTimestamp;
    createdAt: FirestoreTimestamp;
}

// (Duplicate interfaces removed — AccountSettings and SystemSettings defined above)

// Default Settings
const defaultHomeSettings: Omit<HomeSettings, 'updatedAt' | 'createdAt'> = {
    authorInfo: {
        name: 'عبدالعظيم أبو فراس',
        photo: '',
        bio: 'أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني، أسافر أحياناً وأُدوّن عن نثريات السفر وفرائده.',
        role: 'كاتب ومفكر'
    },
    homeVisibility: {
        showHero: true,
        showLatestPostsSection: true
    },
    heroContent: {
        heroTitle: 'أنا عبدالعظيم أبو فراس',
        heroSubtitle: 'أستنير بالحرف في مدلهمات الحياة، أسير في بساتين الكتب وأقطف منها ما يروقني، أسافر أحياناً وأُدوّن عن نثريات السفر وفرائده.',
        ctaButton: {
            text: 'استكشف المقالات',
            url: '/blog'
        }
    },
    socialLinks: {
        twitter: '',
        facebook: '',
        linkedin: '',
        github: ''
    }
};

const defaultAppearanceSettings: Omit<AppearanceSettings, 'updatedAt' | 'createdAt'> = {
    primaryColor: '#d97706',
    secondaryColor: '#78716c',
    postsPerPage: 12
};

const defaultSystemSettings: Omit<SystemSettings, 'updatedAt' | 'createdAt'> = {
    siteTitle: 'مدونة عبدالعظيم أبو فراس',
    siteDescription: 'مدونة شخصية تعبر عن رحلة المعرفة والفكر',
    contactEmail: '',
    notificationEmail: ''
};

// Home Settings Functions
export async function getHomeSettings(): Promise<HomeSettings | null> {
    try {
        const docRef = doc(db, 'settings', 'home');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as HomeSettings;
        } else {
            // Create default settings if none exist
            const newSettings: HomeSettings = {
                ...defaultHomeSettings,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(docRef, newSettings);
            return newSettings;
        }
    } catch (error) {
        console.error('Error fetching home settings:', error);
        return null;
    }
}

export async function updateHomeSettings(settings: Partial<Omit<HomeSettings, 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
        const docRef = doc(db, 'settings', 'home');
        await updateDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating home settings:', error);
        return false;
    }
}

// Appearance Settings Functions
export async function getAppearanceSettings(): Promise<AppearanceSettings | null> {
    try {
        const docRef = doc(db, 'settings', 'appearance');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as AppearanceSettings;
        } else {
            // Create default settings if none exist
            const newSettings: AppearanceSettings = {
                ...defaultAppearanceSettings,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(docRef, newSettings);
            return newSettings;
        }
    } catch (error) {
        console.error('Error fetching appearance settings:', error);
        return null;
    }
}

export async function updateAppearanceSettings(settings: Partial<Omit<AppearanceSettings, 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
        const docRef = doc(db, 'settings', 'appearance');
        await updateDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating appearance settings:', error);
        return false;
    }
}

// Account Settings Functions
export async function getAccountSettings(): Promise<AccountSettings | null> {
    try {
        const docRef = doc(db, 'settings', 'account');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as AccountSettings;
        } else {
            // Return null if no account settings exist
            return null;
        }
    } catch (error) {
        console.error('Error fetching account settings:', error);
        return null;
    }
}

export async function updateAccountSettings(settings: Partial<Omit<AccountSettings, 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
        const docRef = doc(db, 'settings', 'account');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, {
                ...settings,
                updatedAt: serverTimestamp()
            });
        } else {
            // Create new document if it doesn't exist
            const newSettings: AccountSettings = {
                ...settings as AccountSettings,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(docRef, newSettings);
        }
        return true;
    } catch (error) {
        console.error('Error updating account settings:', error);
        return false;
    }
}

// System Settings Functions
export async function getSystemSettings(): Promise<SystemSettings | null> {
    try {
        const docRef = doc(db, 'settings', 'system');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as SystemSettings;
        } else {
            // Create default settings if none exist
            const newSettings: SystemSettings = {
                ...defaultSystemSettings,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(docRef, newSettings);
            return newSettings;
        }
    } catch (error) {
        console.error('Error fetching system settings:', error);
        return null;
    }
}

export async function updateSystemSettings(settings: Partial<Omit<SystemSettings, 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
        const docRef = doc(db, 'settings', 'system');
        await updateDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating system settings:', error);
        return false;
    }
}
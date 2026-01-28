import { Timestamp } from "firebase/firestore";

export interface Post {
    id: string;
    title: string;
    slug: string;
    contentMarkdown: string;
    seo_title?: string;
    seo_description?: string;
    categoryId: string;
    tags: string[]; // tag names or IDs
    published: boolean;
    publishedAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    featuredImageUrl?: string | null;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt?: Timestamp;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

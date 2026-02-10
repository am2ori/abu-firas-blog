'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Category } from "@/types";
import { getCategories } from '@/lib/categories';
import { usePostsFilters } from '@/hooks/use-posts-filters';
import PostsFilters from './_components/posts-filters';
import PostsTable from './_components/posts-table';
import { Plus } from 'lucide-react';

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        filters,
        filteredPosts,
        stats,
        hasActiveFilters,
        setSearch,
        setStatus,
        setCategoryId,
        setSortField,
        setSortOrder,
        resetFilters,
    } = usePostsFilters(posts);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch posts and categories in parallel
                const [postsSnapshot, cats] = await Promise.all([
                    getDocs(query(collection(db, 'posts'), orderBy('updatedAt', 'desc'))),
                    getCategories(),
                ]);

                const fetchedPosts = postsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                setPosts(fetchedPosts);
                setCategories(cats);
            } catch (error) {
                console.error("Error fetching admin posts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        try {
            await deleteDoc(doc(db, 'posts', id));
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("حدث خطأ أثناء الحذف");
        }
    }

    async function handleTogglePublish(post: Post) {
        try {
            const newPublishedState = !post.published;
            const updates: Partial<Post> = { published: newPublishedState };

            if (newPublishedState && !post.publishedAt) {
                updates.publishedAt = Timestamp.now();
            }

            await updateDoc(doc(db, 'posts', post.id), updates);

            setPosts(posts.map(p =>
                p.id === post.id
                    ? { ...p, ...updates }
                    : p
            ));
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert("حدث خطأ أثناء تغيير الحالة");
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-stone-800">المقالات</h1>
                <Link
                    href="/admin/posts/new"
                    className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    كتابة مقال جديد
                </Link>
            </div>

            {/* Filters */}
            <PostsFilters
                filters={filters}
                categories={categories}
                stats={stats}
                hasActiveFilters={hasActiveFilters}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onCategoryChange={setCategoryId}
                onSortFieldChange={setSortField}
                onSortOrderChange={setSortOrder}
                onReset={resetFilters}
            />

            {/* Posts Table / Cards */}
            <PostsTable
                posts={filteredPosts}
                categories={categories}
                loading={loading}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDelete}
            />
        </div>
    );
}

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
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

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

    // Clear selection when filters change to avoid actions on hidden items
    useEffect(() => {
        setSelectedPosts([]);
    }, [filters]);

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        try {
            await deleteDoc(doc(db, 'posts', id));
            setPosts(posts.filter(p => p.id !== id));
            setSelectedPosts(prev => prev.filter(pId => pId !== id));
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

    // Selection Handlers
    const handleSelectPost = (id: string) => {
        setSelectedPosts(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPosts(filteredPosts.map(p => p.id));
        } else {
            setSelectedPosts([]);
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedPosts.length} مقال؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        setIsBulkActionLoading(true);
        try {
            const batch = import('firebase/firestore').then(({ writeBatch }) => {
                const b = writeBatch(db);
                selectedPosts.forEach(id => {
                    const docRef = doc(db, 'posts', id);
                    b.delete(docRef);
                });
                return b.commit();
            });

            await batch;

            setPosts(prev => prev.filter(p => !selectedPosts.includes(p.id)));
            setSelectedPosts([]);
        } catch (error) {
            console.error("Error performing bulk delete:", error);
            alert("فشل حذف المقالات المحددة");
        } finally {
            setIsBulkActionLoading(false);
        }
    };

    const handleBulkPublishStatus = async (status: boolean) => {
        setIsBulkActionLoading(true);
        try {
            // Because we might need serverTimestamp for publishAt, handle appropriately
            // But writeBatch updates take specific values. 
            // We'll update the local state optimistically or re-fetch.
            // For simplicity, we create updates array and commit batch.

            const batch = await import('firebase/firestore').then(({ writeBatch }) => writeBatch(db));
            const updates: { id: string, data: Partial<Post> }[] = [];

            selectedPosts.forEach(id => {
                const post = posts.find(p => p.id === id);
                if (!post) return;

                // Skip if status is already same
                if (post.published === status) return;

                const docRef = doc(db, 'posts', id);
                const data: any = { published: status };

                if (status && !post.publishedAt) {
                    data.publishedAt = Timestamp.now();
                }

                batch.update(docRef, data);
                updates.push({ id, data });
            });

            if (updates.length > 0) {
                await batch.commit();

                // Update local state
                setPosts(prev => prev.map(p => {
                    const update = updates.find(u => u.id === p.id);
                    if (update) {
                        return { ...p, ...update.data };
                    }
                    return p;
                }));
            }

            setSelectedPosts([]);
        } catch (error) {
            console.error("Error updating bulk status:", error);
            alert("فشل تحديث حالة المقالات");
        } finally {
            setIsBulkActionLoading(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Bulk Action Bar */}
            {selectedPosts.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-6 animate-in slide-in-from-bottom-5">
                    <span className="font-medium text-sm">تم تحديد {selectedPosts.length} مقال</span>
                    <div className="h-4 w-px bg-stone-700" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkPublishStatus(true)}
                            disabled={isBulkActionLoading}
                            className="text-sm hover:text-green-400 transition-colors disabled:opacity-50"
                        >
                            نشر
                        </button>
                        <button
                            onClick={() => handleBulkPublishStatus(false)}
                            disabled={isBulkActionLoading}
                            className="text-sm hover:text-yellow-400 transition-colors disabled:opacity-50"
                        >
                            إلغاء النشر
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkActionLoading}
                            className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                            حذف
                        </button>
                    </div>
                    <button
                        onClick={() => setSelectedPosts([])}
                        className="ml-2 text-stone-500 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}

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
                selectedPosts={selectedPosts}
                onSelectPost={handleSelectPost}
                onSelectAll={handleSelectAll}
            />
        </div>
    );
}

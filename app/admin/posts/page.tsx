'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from "@/types";

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const postsRef = collection(db, 'posts');
                const q = query(postsRef, orderBy('updatedAt', 'desc'));
                const snapshot = await getDocs(q);
                const fetchedPosts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching admin posts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
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

            // If publishing and no date exists, set it to now
            if (newPublishedState && !post.publishedAt) {
                updates.publishedAt = Timestamp.now();
            }

            await updateDoc(doc(db, 'posts', post.id), updates);

            // Update local state
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
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">المقالات</h1>
                <Link
                    href="/admin/posts/new"
                    className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <span>+</span> كتابة مقال جديد
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {/* Desktop Table */}
                <table className="w-full text-right hidden md:table">
                    <thead className="bg-stone-50 text-stone-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">العنوان</th>
                            <th className="px-6 py-4 font-medium">الحالة</th>
                            <th className="px-6 py-4 font-medium">تاريخ النشر</th>
                            <th className="px-6 py-4 font-medium">تاريخ الإنشاء</th>
                            <th className="px-6 py-4 font-medium">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-stone-500">جاري التحميل...</td>
                            </tr>
                        ) : posts.map((post) => (
                            <tr key={post.id} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-6 py-4 text-stone-900 font-medium">
                                    {post.title}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleTogglePublish(post)}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${post.published
                                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                                            }`}
                                        title={post.published ? 'إلغاء النشر' : 'نشر المقال'}
                                    >
                                        {post.published ? 'منشور' : 'مسودة'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-stone-500 text-sm" dir="ltr">
                                    {post.publishedAt
                                        ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-GB")
                                        : '---'}
                                </td>
                                <td className="px-6 py-4 text-stone-500 text-sm" dir="ltr">
                                    {post.createdAt
                                        ? new Date(post.createdAt.seconds * 1000).toLocaleDateString("en-GB")
                                        : '---'}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-4 items-center">
                                        <button
                                            onClick={() => handleTogglePublish(post)}
                                            className={`text-sm font-medium transition-colors ${post.published
                                                ? 'text-yellow-600 hover:text-yellow-800'
                                                : 'text-green-600 hover:text-green-800'
                                                }`}
                                        >
                                            {post.published ? 'إلغاء النشر' : 'نشر'}
                                        </button>
                                        <div className="h-4 w-px bg-stone-300"></div>
                                        <Link href={`/admin/posts/${post.id}/edit`} className="text-stone-600 hover:text-stone-900 font-medium">
                                            تعديل
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-stone-100">
                    {loading ? (
                        <div className="p-8 text-center text-stone-500">جاري التحميل...</div>
                    ) : posts.map((post) => (
                        <div key={post.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-stone-900 line-clamp-2">{post.title}</h3>
                                <button
                                    onClick={() => handleTogglePublish(post)}
                                    className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${post.published
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}
                                >
                                    {post.published ? 'منشور' : 'مسودة'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-xs text-stone-400">
                                <span>نشر: {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("en-GB") : '-'}</span>
                                <span dir="ltr">{post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString("en-GB") : '-'}</span>
                            </div>

                            <div className="flex items-center gap-3 pt-2 border-t border-stone-50">
                                <Link
                                    href={`/admin/posts/${post.id}/edit`}
                                    className="flex-1 py-1.5 text-center text-sm bg-stone-50 text-stone-700 rounded hover:bg-stone-100"
                                >
                                    تعديل
                                </Link>
                                <button
                                    onClick={() => handleTogglePublish(post)}
                                    className="flex-1 py-1.5 text-center text-sm bg-stone-50 text-stone-700 rounded hover:bg-stone-100"
                                >
                                    {post.published ? 'إلغاء' : 'نشر'}
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="px-3 py-1.5 text-center text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && posts.length === 0 && (
                    <div className="p-8 text-center text-stone-500">
                        لا توجد مقالات بعد. ابدأ بالكتابة!
                    </div>
                )}
            </div>
        </div>
    );
}

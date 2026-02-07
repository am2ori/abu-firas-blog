'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import { FileText, CheckCircle, FileClock, FolderOpen, ArrowRight, PenTool, Tag } from 'lucide-react';

interface DashboardStats {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    categoriesCount: number;
    tagsCount: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        categoriesCount: 0,
        tagsCount: 0
    });
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // greeting logic
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting('صباح الخير، أبو فراس ☀️');
        } else if (hour >= 12 && hour < 17) {
            setGreeting('طاب مساؤك، أبو فراس 🌤️');
        } else {
            setGreeting('مساء الخير، أبو فراس 🌙');
        }

        async function fetchStats() {
            try {
                // Collections references
                const postsColl = collection(db, 'posts');
                const catsColl = collection(db, 'categories');
                const tagsColl = collection(db, 'tags');

                // 1. Get Counts
                // Note: getCountFromServer is efficient for counting
                const totalPostsSnapshot = await getCountFromServer(postsColl);

                const publishedQuery = query(postsColl, where('published', '==', true));
                const publishedSnapshot = await getCountFromServer(publishedQuery);

                const catsSnapshot = await getCountFromServer(catsColl);
                const tagsSnapshot = await getCountFromServer(tagsColl);

                const total = totalPostsSnapshot.data().count;
                const published = publishedSnapshot.data().count;

                setStats({
                    totalPosts: total,
                    publishedPosts: published,
                    draftPosts: total - published,
                    categoriesCount: catsSnapshot.data().count,
                    tagsCount: tagsSnapshot.data().count
                });

                // 2. Get Recent Posts
                const recentQuery = query(postsColl, orderBy('updatedAt', 'desc'), limit(5));
                const recentSnapshot = await getDocs(recentQuery);
                const posts = recentSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                setRecentPosts(posts);

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-stone-400">جاري تحميل الإحصائيات...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-stone-800">{greeting}</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                        <FileText size={24} />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{stats.totalPosts}</div>
                    <div className="text-sm text-stone-500">إجمالي المقالات</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3">
                        <CheckCircle size={24} />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{stats.publishedPosts}</div>
                    <div className="text-sm text-stone-500">منشورة</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full mb-3">
                        <FileClock size={24} />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{stats.draftPosts}</div>
                    <div className="text-sm text-stone-500">مسودة</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3">
                        <FolderOpen size={24} />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{stats.categoriesCount}</div>
                    <div className="text-sm text-stone-500">تصانيف</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-full mb-3">
                        <Tag size={24} />
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{stats.tagsCount}</div>
                    <div className="text-sm text-stone-500">وسوم</div>
                </div>
            </div>

            {/* Quick Actions & Recent Posts */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Recent Posts Column */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-stone-800">آخر المقالات المحدثة</h2>
                        <Link href="/admin/posts" className="text-sm text-amber-900 hover:text-amber-700 font-medium flex items-center gap-1">
                            عرض الكل <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        {recentPosts.length > 0 ? (
                            <div className="divide-y divide-stone-100">
                                {recentPosts.map(post => (
                                    <div key={post.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${post.published ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <div className="truncate font-medium text-stone-700">{post.title}</div>
                                        </div>
                                        <Link
                                            href={`/admin/posts/${post.id}/edit`}
                                            className="text-stone-400 hover:text-amber-600 transition-colors"
                                            title="تعديل"
                                        >
                                            <PenTool size={16} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-stone-500 text-sm">
                                لا توجد مقالات لعرضها.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Column */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-stone-800">إجراءات سريعة</h2>
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
                        <Link
                            href="/admin/posts/new"
                            className="block w-full py-3 px-4 bg-amber-900 text-white rounded-lg text-center font-medium hover:bg-amber-800 transition-colors shadow-sm"
                        >
                            + مقال جديد
                        </Link>
                        <Link
                            href="/admin/categories/new"
                            className="block w-full py-3 px-4 bg-white border border-stone-200 text-stone-700 rounded-lg text-center font-medium hover:bg-stone-50 transition-colors"
                        >
                            + تصنيف جديد
                        </Link>
                        <Link
                            href="/admin/tags/new"
                            className="block w-full py-3 px-4 bg-white border border-stone-200 text-stone-700 rounded-lg text-center font-medium hover:bg-stone-50 transition-colors"
                        >
                            + وسم جديد
                        </Link>
                        <Link
                            href="/"
                            target="_blank"
                            className="block w-full py-3 px-4 bg-white border border-stone-200 text-stone-700 rounded-lg text-center font-medium hover:bg-stone-50 transition-colors"
                        >
                            عرض الموقع
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

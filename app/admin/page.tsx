'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import { 
    FileText, 
    CheckCircle, 
    FileClock, 
    FolderOpen, 
    ArrowRight, 
    PenTool, 
    Tag, 
    TrendingUp,
    Eye,
    Clock,
    Plus,
    ExternalLink
} from 'lucide-react';

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
        // greeting logic with better emojis
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting('صباح النور، أبو فراس 🌅');
        } else if (hour >= 12 && hour < 17) {
            setGreeting('أهلاً بك في وقت الظهر، أبو فراس ☀️');
        } else if (hour >= 17 && hour < 21) {
            setGreeting('طاب مساؤك، أبو فراس 🌆');
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
                const recentQuery = query(postsColl, orderBy('updatedAt', 'desc'), limit(6));
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
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <div className="text-stone-400">جاري تحميل الإحصائيات...</div>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'إجمالي المقالات',
            value: stats.totalPosts,
            icon: FileText,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        },
        {
            title: 'منشورة',
            value: stats.publishedPosts,
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200'
        },
        {
            title: 'مسودة',
            value: stats.draftPosts,
            icon: FileClock,
            color: 'amber',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-200'
        },
        {
            title: 'التصنيفات',
            value: stats.categoriesCount,
            icon: FolderOpen,
            color: 'purple',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200'
        },
        {
            title: 'الوسوم',
            value: stats.tagsCount,
            icon: Tag,
            color: 'pink',
            bgColor: 'bg-pink-50',
            iconColor: 'text-pink-600',
            borderColor: 'border-pink-200'
        }
    ];

    const quickActions = [
        {
            title: 'مقال جديد',
            href: '/admin/posts/new',
            icon: Plus,
            primary: true
        },
        {
            title: 'تصنيف جديد',
            href: '/admin/categories/new',
            icon: Plus,
            primary: false
        },
        {
            title: 'وسم جديد',
            href: '/admin/tags/new',
            icon: Plus,
            primary: false
        },
        {
            title: 'عرض الموقع',
            href: '/',
            icon: ExternalLink,
            primary: false,
            external: true
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">{greeting}</h1>
                <p className="text-stone-600">مرحباً بك في لوحة التحكم. إليك ملخص لأحدث نشاطاتك.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="
                                bg-white p-6 rounded-xl border border-stone-200 
                                hover:shadow-card hover:border-stone-300 
                                transition-all duration-300 group cursor-pointer
                            "
                        >
                            <div className={`w-12 h-12 ${stat.bgColor} ${stat.iconColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon size={24} />
                            </div>
                            <div className="text-2xl font-bold text-stone-900 mb-1 group-hover:text-amber-600 transition-colors">
                                {stat.value}
                            </div>
                            <div className="text-sm text-stone-500">{stat.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Posts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-stone-900">آخر المقالات المحدثة</h2>
                            <p className="text-stone-500 text-sm mt-1">أحدث 6 مقالات تم تعديلها مؤخراً</p>
                        </div>
                        <Link 
                            href="/admin/posts" 
                            className="
                                inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 
                                font-medium transition-colors group
                            "
                        >
                            عرض الكل
                            <ArrowRight size={16} className="transform group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                        {recentPosts.length > 0 ? (
                            <div className="divide-y divide-stone-100">
                                {recentPosts.map((post, index) => (
                                    <div 
                                        key={post.id} 
                                        className="
                                            p-4 hover:bg-stone-50 transition-colors 
                                            group cursor-pointer animate-fade-in-up
                                        "
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`
                                                    w-3 h-3 rounded-full flex-shrink-0
                                                    ${post.published 
                                                        ? 'bg-green-500 shadow-green-200 shadow-sm' 
                                                        : 'bg-amber-500 shadow-amber-200 shadow-sm'
                                                    }
                                                `} />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                                                        <Clock size={12} />
                                                        {post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toLocaleDateString("ar-EG") : 'غير محدد'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/blog/${post.slug || post.id}`}
                                                    target="_blank"
                                                    className="
                                                        p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 
                                                        rounded-lg transition-all duration-200
                                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                                                    "
                                                    title="عرض المقال"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link
                                                    href={`/admin/posts/${post.id}/edit`}
                                                    className="
                                                        p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 
                                                        rounded-lg transition-all duration-200
                                                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
                                                    "
                                                    title="تعديل المقال"
                                                >
                                                    <PenTool size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <FileText size={48} className="mx-auto text-stone-300 mb-4" />
                                <h3 className="text-lg font-medium text-stone-600 mb-2">لا توجد مقالات بعد</h3>
                                <p className="text-stone-500 text-sm mb-6">ابدأ بكتابة أول مقال لك الآن!</p>
                                <Link
                                    href="/admin/posts/new"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    <Plus size={16} />
                                    كتابة مقال جديد
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-2">إجراءات سريعة</h2>
                        <p className="text-stone-500 text-sm">أدوات شائعة لتنفيذ المهام بسرعة</p>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                        <div className="p-6 space-y-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.title}
                                        href={action.href}
                                        target={action.external ? '_blank' : '_self'}
                                        className={`
                                            flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                                            transition-all duration-200
                                            ${action.primary 
                                                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md' 
                                                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-amber-700 border border-stone-200'
                                            }
                                            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} />
                                            <span className="font-medium">{action.title}</span>
                                        </div>
                                        {action.external && <ExternalLink size={14} />}
                                    </Link>
                                );
                            })}
                        </div>
                        
                        {/* Stats Summary */}
                        <div className="border-t border-stone-100 p-6 bg-stone-50">
                            <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
                                <TrendingUp size={16} />
                                <span className="font-medium">نظرة سريعة</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">معدل النشر:</span>
                                    <span className="font-medium text-stone-900">
                                        {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">المقالات النشطة:</span>
                                    <span className="font-medium text-green-600">{stats.publishedPosts}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">تحت المراجعة:</span>
                                    <span className="font-medium text-amber-600">{stats.draftPosts}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

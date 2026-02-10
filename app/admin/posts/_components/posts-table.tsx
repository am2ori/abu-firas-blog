'use client';

import Link from 'next/link';
import { Post, Category } from '@/types';

interface PostsTableProps {
    posts: Post[];
    categories: Category[];
    loading: boolean;
    onTogglePublish: (post: Post) => void;
    onDelete: (id: string) => void;
}

function formatDate(timestamp: { seconds: number } | null | undefined): string {
    if (!timestamp) return '---';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-GB');
}

function getCategoryName(categoryId: string, categories: Category[]): string {
    return categories.find(c => c.id === categoryId)?.name || '—';
}

export default function PostsTable({ posts, categories, loading, onTogglePublish, onDelete }: PostsTableProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {/* Desktop skeleton */}
                <div className="hidden md:block">
                    <div className="bg-stone-50 px-6 py-4 flex gap-6">
                        {['w-2/5', 'w-16', 'w-20', 'w-24', 'w-24', 'w-28'].map((w, i) => (
                            <div key={i} className={`h-4 bg-stone-200 rounded ${w} animate-pulse`} />
                        ))}
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="px-6 py-4 flex gap-6 border-t border-stone-100">
                            <div className="h-4 bg-stone-100 rounded w-2/5 animate-pulse" />
                            <div className="h-4 bg-stone-100 rounded w-16 animate-pulse" />
                            <div className="h-4 bg-stone-100 rounded w-20 animate-pulse" />
                            <div className="h-4 bg-stone-100 rounded w-24 animate-pulse" />
                            <div className="h-4 bg-stone-100 rounded w-24 animate-pulse" />
                            <div className="h-4 bg-stone-100 rounded w-28 animate-pulse" />
                        </div>
                    ))}
                </div>
                {/* Mobile skeleton */}
                <div className="md:hidden divide-y divide-stone-100">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 space-y-3 animate-pulse">
                            <div className="h-5 bg-stone-100 rounded w-3/4" />
                            <div className="h-3 bg-stone-100 rounded w-1/2" />
                            <div className="flex gap-2 pt-2"><div className="h-8 bg-stone-100 rounded flex-1" /><div className="h-8 bg-stone-100 rounded flex-1" /></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">لا توجد نتائج</h3>
                <p className="text-stone-500 text-sm">جرّب تغيير الفلاتر أو مصطلح البحث</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {/* Desktop Table */}
            <table className="w-full text-right hidden md:table">
                <thead className="bg-stone-50 text-stone-500 text-sm">
                    <tr>
                        <th className="px-6 py-4 font-medium">العنوان</th>
                        <th className="px-6 py-4 font-medium">الحالة</th>
                        <th className="px-6 py-4 font-medium">التصنيف</th>
                        <th className="px-6 py-4 font-medium">تاريخ النشر</th>
                        <th className="px-6 py-4 font-medium">تاريخ التحديث</th>
                        <th className="px-6 py-4 font-medium">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-stone-50/50 transition-colors group">
                            <td className="px-6 py-4 text-stone-900 font-medium max-w-xs">
                                <Link
                                    href={`/admin/posts/${post.id}/edit`}
                                    className="hover:text-amber-700 transition-colors line-clamp-1"
                                >
                                    {post.title}
                                </Link>
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {post.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <span className="text-[10px] text-stone-400">+{post.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onTogglePublish(post)}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${post.published
                                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                        : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                                        }`}
                                    title={post.published ? 'إلغاء النشر' : 'نشر المقال'}
                                >
                                    {post.published ? 'منشور' : 'مسودة'}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm">
                                {getCategoryName(post.categoryId, categories)}
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm" dir="ltr">
                                {formatDate(post.publishedAt)}
                            </td>
                            <td className="px-6 py-4 text-stone-500 text-sm" dir="ltr">
                                {formatDate(post.updatedAt)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div className="flex gap-3 items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/posts/${post.id}/edit`} className="text-stone-600 hover:text-amber-700 font-medium transition-colors">
                                        تعديل
                                    </Link>
                                    <div className="h-4 w-px bg-stone-200" />
                                    <button
                                        onClick={() => onTogglePublish(post)}
                                        className={`font-medium transition-colors ${post.published
                                            ? 'text-yellow-600 hover:text-yellow-800'
                                            : 'text-green-600 hover:text-green-800'
                                            }`}
                                    >
                                        {post.published ? 'إلغاء النشر' : 'نشر'}
                                    </button>
                                    <div className="h-4 w-px bg-stone-200" />
                                    <button
                                        onClick={() => onDelete(post.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
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
                {posts.map((post) => (
                    <div key={post.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                            <Link
                                href={`/admin/posts/${post.id}/edit`}
                                className="font-bold text-stone-900 line-clamp-2 hover:text-amber-700 transition-colors flex-1"
                            >
                                {post.title}
                            </Link>
                            <button
                                onClick={() => onTogglePublish(post)}
                                className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${post.published
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}
                            >
                                {post.published ? 'منشور' : 'مسودة'}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-stone-400">
                            <span>{getCategoryName(post.categoryId, categories)}</span>
                            <span>•</span>
                            <span dir="ltr">{formatDate(post.updatedAt)}</span>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 4).map(tag => (
                                    <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                            <Link
                                href={`/admin/posts/${post.id}/edit`}
                                className="flex-1 py-2 text-center text-sm bg-stone-50 text-stone-700 rounded-lg hover:bg-stone-100 font-medium transition-colors"
                            >
                                تعديل
                            </Link>
                            <button
                                onClick={() => onTogglePublish(post)}
                                className="flex-1 py-2 text-center text-sm bg-stone-50 text-stone-700 rounded-lg hover:bg-stone-100 font-medium transition-colors"
                            >
                                {post.published ? 'إلغاء' : 'نشر'}
                            </button>
                            <button
                                onClick={() => onDelete(post.id)}
                                className="px-4 py-2 text-center text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

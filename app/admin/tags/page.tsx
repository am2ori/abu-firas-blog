'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag } from '@/types';
import { getTags, deleteTag } from '@/lib/tags';

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const tagsData = await getTags();
            setTags(tagsData);
        } catch (error) {
            console.error('Error fetching tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الوسم؟')) return;

        setDeleting(tagId);
        try {
            await deleteTag(tagId);
            setTags(tags.filter(tag => tag.id !== tagId));
        } catch (error) {
            console.error('Error deleting tag:', error);
            alert('حدث خطأ أثناء حذف الوسم');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-stone-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-stone-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-900">إدارة الوسوم</h1>
                <Link
                    href="/admin/tags/new"
                    className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition-colors"
                >
                    وسم جديد
                </Link>
            </div>

            {tags.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200">
                    <h3 className="text-lg font-medium text-stone-600 mb-2">لا توجد وسوم</h3>
                    <p className="text-stone-500 mb-4">ابدأ بإضافة وسوم جديدة لتنظيم مقالاتك</p>
                    <Link
                        href="/admin/tags/new"
                        className="inline-block bg-amber-900 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors"
                    >
                        إضافة وسم جديد
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50 border-b border-stone-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-stone-900">اسم الوسم</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-stone-900">الرابط</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-stone-900">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {tags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
                                                <span className="font-medium text-stone-900">#{tag.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-stone-100 px-2 py-1 rounded text-stone-600 ltr" dir="ltr">
                                                {tag.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/admin/tags/${tag.id}/edit`}
                                                    className="text-amber-700 hover:text-amber-800 font-medium text-sm"
                                                >
                                                    تعديل
                                                </Link>
                                                <span className="text-stone-300">|</span>
                                                <button
                                                    onClick={() => handleDeleteTag(tag.id)}
                                                    disabled={deleting === tag.id}
                                                    className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                                                >
                                                    {deleting === tag.id ? 'جاري الحذف...' : 'حذف'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
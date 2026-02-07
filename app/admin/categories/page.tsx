'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Category } from "@/types";
import { getCategories, deleteCategory } from '@/lib/categories';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchCategories() {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    }

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error loading categories:", error);
            } finally {
                setLoading(false);
            }
        };
        
        setLoading(true);
        loadCategories();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
        try {
            await deleteCategory(id);
            // Optimistic update or refetch
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("حدث خطأ أثناء الحذف");
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">التصنيفات</h1>
                <Link
                    href="/admin/categories/new"
                    className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <span>+</span> إضافة تصنيف
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {/* Desktop Table */}
                <table className="w-full text-right hidden md:table">
                    <thead className="bg-stone-50 text-stone-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">الاسم</th>
                            <th className="px-6 py-4 font-medium">الرابط (Slug)</th>
                            <th className="px-6 py-4 font-medium">الوصف</th>
                            <th className="px-6 py-4 font-medium">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-stone-500">جاري التحميل...</td>
                            </tr>
                        ) : categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-6 py-4 text-stone-900 font-medium">
                                    {cat.name}
                                </td>
                                <td className="px-6 py-4 text-stone-600 font-mono text-sm" dir="ltr">
                                    {cat.slug}
                                </td>
                                <td className="px-6 py-4 text-stone-500 text-sm truncate max-w-xs">
                                    {cat.description || '---'}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-4">
                                        <Link href={`/admin/categories/${cat.id}/edit`} className="text-amber-700 hover:text-amber-900 font-medium">
                                            تعديل
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-800"
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
                    ) : categories.map((cat) => (
                        <div key={cat.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-stone-900">{cat.name}</h3>
                                <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded" dir="ltr">{cat.slug}</span>
                            </div>

                            {cat.description && (
                                <p className="text-sm text-stone-500 line-clamp-2">
                                    {cat.description}
                                </p>
                            )}

                            <div className="flex items-center gap-3 pt-2 border-t border-stone-50">
                                <Link
                                    href={`/admin/categories/${cat.id}/edit`}
                                    className="flex-1 py-1.5 text-center text-sm bg-stone-50 text-stone-700 rounded hover:bg-stone-100"
                                >
                                    تعديل
                                </Link>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="px-3 py-1.5 text-center text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && categories.length === 0 && (
                    <div className="p-8 text-center text-stone-500">
                        لا توجد تصنيفات بعد.
                    </div>
                )}
            </div>
        </div>
    );
}

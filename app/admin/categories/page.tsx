'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Category } from "@/types";
import { getCategories, deleteCategory } from '@/lib/categories';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error loading categories:", error);
        } finally {
            setLoading(false);
        }
    }

    // Selection Handlers
    const handleSelectCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCategories(categories.map(c => c.id));
        } else {
            setSelectedCategories([]);
        }
    };

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            setSelectedCategories(prev => prev.filter(cId => cId !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("حدث خطأ أثناء الحذف");
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedCategories.length} تصنيف؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        setIsBulkLoading(true);
        try {
            const batch = writeBatch(db);
            selectedCategories.forEach(id => {
                const docRef = doc(db, 'categories', id);
                batch.delete(docRef);
            });
            await batch.commit();

            setCategories(prev => prev.filter(c => !selectedCategories.includes(c.id)));
            setSelectedCategories([]);
        } catch (error) {
            console.error('Error performing bulk delete:', error);
            alert('فشل حذف التصنيفات المحددة');
        } finally {
            setIsBulkLoading(false);
        }
    };

    const allSelected = categories.length > 0 && selectedCategories.length === categories.length;
    const isIndeterminate = selectedCategories.length > 0 && selectedCategories.length < categories.length;

    return (
        <div className="relative">
            {/* Bulk Action Bar */}
            {selectedCategories.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-6 animate-in slide-in-from-bottom-5">
                    <span className="font-medium text-sm">تم تحديد {selectedCategories.length} تصنيف</span>
                    <div className="h-4 w-px bg-stone-700" />
                    <button
                        onClick={handleBulkDelete}
                        disabled={isBulkLoading}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                        حذف المحدد
                    </button>
                    <button
                        onClick={() => setSelectedCategories([])}
                        className="ml-2 text-stone-500 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}

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
                            <th className="px-4 py-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="px-6 py-4 font-medium">الاسم</th>
                            <th className="px-6 py-4 font-medium">الرابط (Slug)</th>
                            <th className="px-6 py-4 font-medium">الوصف</th>
                            <th className="px-6 py-4 font-medium">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-stone-500">جاري التحميل...</td>
                            </tr>
                        ) : categories.map((cat) => (
                            <tr key={cat.id} className={`hover:bg-stone-50/50 transition-colors group ${selectedCategories.includes(cat.id) ? 'bg-amber-50/30' : ''}`}>
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={() => handleSelectCategory(cat.id)}
                                    />
                                </td>
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
                        <div key={cat.id} className={`p-4 space-y-2 ${selectedCategories.includes(cat.id) ? 'bg-amber-50/30' : ''}`}>
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    checked={selectedCategories.includes(cat.id)}
                                    onChange={() => handleSelectCategory(cat.id)}
                                />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-stone-900">{cat.name}</h3>
                                        <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded" dir="ltr">{cat.slug}</span>
                                    </div>

                                    {cat.description && (
                                        <p className="text-sm text-stone-500 line-clamp-2">
                                            {cat.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2 border-t border-stone-50 ml-7">
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

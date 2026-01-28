'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { addCategory, updateCategory } from '@/lib/categories';
import { generateSlug } from '@/lib/slug';

interface CategoryFormProps {
    category?: Category;
}

export default function CategoryForm({ category }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [description, setDescription] = useState(category?.description || '');

    const [isSlugTouched, setIsSlugTouched] = useState(false);

    // Auto-generate slug from name if not manually edited
    useEffect(() => {
        if (!category && !isSlugTouched && name) {
            const generatedSlug = generateSlug(name);
            setSlug(generatedSlug);
        }
    }, [name, isSlugTouched, category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const categoryData: Partial<Category> = {
                name,
                slug,
                description,
            };

            if (category) {
                await updateCategory(category.id, categoryData);
            } else {
                await addCategory(categoryData);
            }

            router.push('/admin/categories');
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(`خطأ: ${err.message}`);
            } else {
                setError('حدث خطأ أثناء الحفظ.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-stone-800">
                    {category ? 'تعديل تصنيف' : 'تصنيف جديد'}
                </h1>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50"
                >
                    {loading ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

            <div className="space-y-6 bg-white p-6 rounded-lg border border-stone-200">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">اسم التصنيف</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        placeholder="مثال: التقنية، السفر..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">الرابط (Slug)</label>
                    <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsSlugTouched(true);
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none bg-stone-50 text-stone-600 ltr text-right"
                        dir="ltr"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">الوصف (اختياري)</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                </div>
            </div>
        </form>
    );
}

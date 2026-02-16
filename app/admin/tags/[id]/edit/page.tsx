'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTag, updateTag } from '@/lib/tags';
import { generateSlug } from '@/lib/slug';
import { Tag } from '@/types';
import { use } from 'react';

export default function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    useEffect(() => {
        const fetchTag = async () => {
            try {
                const tag = await getTag(id);
                if (tag) {
                    setName(tag.name);
                    setSlug(tag.slug);
                } else {
                    setError('لم يتم العثور على الوسم');
                }
            } catch (err) {
                console.error(err);
                setError('حدث خطأ أثناء تحميل بيانات الوسم');
            } finally {
                setLoading(false);
            }
        };

        fetchTag();
    }, [id]);

    // Auto-generate slug from name if not manually edited
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!isSlugTouched) {
            setSlug(generateSlug(newName));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await updateTag(id, {
                name,
                slug,
            });

            router.push('/admin/tags');
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(`خطأ: ${err.message}`);
            } else {
                setError('حدث خطأ أثناء الحفظ.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-stone-500">جاري التحميل...</div>;
    }

    if (error && !name) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
                <button
                    onClick={() => router.back()}
                    className="text-stone-600 hover:text-stone-900"
                >
                    عودة
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-8">
                    <h1 className="text-2xl font-bold text-stone-900">تعديل وسم</h1>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-stone-600 hover:text-stone-800"
                    >
                        إلغاء
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">اسم الوسم</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    placeholder="مثال: تقنية، سفر، برمجة..."
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
                                <p className="text-xs text-stone-400 mt-1">سيتم استخدام هذا الرابط في عناوين URL</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

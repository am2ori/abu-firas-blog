'use client';

import { useEffect, useState, use } from 'react';
import { Category } from '@/types';
import { getCategory } from '@/lib/categories';
import CategoryForm from '../../_components/category-form';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            if (!id) return;
            const data = await getCategory(id);
            setCategory(data);
            setLoading(false);
        }
        fetch();
    }, [id]);

    if (loading) return <div>جاري تحميل التصنيف...</div>;
    if (!category) return <div>التصنيف غير موجود.</div>;

    return <CategoryForm category={category} />;
}

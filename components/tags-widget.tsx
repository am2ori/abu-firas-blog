import Link from 'next/link';
import { Tag } from 'lucide-react';

interface TagsWidgetProps {
    tags: string[];
}

export default function TagsWidget({ tags }: TagsWidgetProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Tag size={18} className="text-amber-600" />
                الوسوم
            </h3>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <Link
                        key={tag}
                        href={`/blog?q=${encodeURIComponent(tag)}`}
                        className="text-xs text-stone-600 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 px-3 py-1.5 rounded-full transition-colors"
                    >
                        {tag}
                    </Link>
                ))}
            </div>
        </div>
    );
}

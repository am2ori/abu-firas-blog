'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/blog?q=${encodeURIComponent(query)}`);
        } else {
            router.push('/blog');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث في المقالات..."
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 bg-white shadow-sm"
                />
                <button
                    type="submit"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-amber-800 transition-colors"
                    aria-label="بحث"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </form>
    );
}

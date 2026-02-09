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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full" noValidate>
            <div className="relative">
                <label htmlFor="search-input" className="sr-only">
                    ابحث في المقالات
                </label>
                <input
                    id="search-input"
                    type="search"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="ابحث في المقالات..."
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="
                        w-full px-4 py-3 pr-12 rounded-lg 
                        border border-stone-200 bg-white shadow-sm
                        focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 
                        outline-none transition-all duration-200
                        text-stone-900 placeholder-stone-400
                        hover:border-stone-300
                    "
                    aria-describedby="search-description"
                />
                <div id="search-description" className="sr-only">
                    أدخل كلمات مفتاحية للبحث في مقالات المدونة
                </div>
                <button
                    type="submit"
                    className="
                        absolute left-2 top-1/2 -translate-y-1/2 p-2 
                        text-stone-400 hover:text-amber-600 hover:bg-amber-50 
                        rounded-lg transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
                    "
                    aria-label="ابحث في المقالات"
                    disabled={!query.trim()}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </form>
    );
}

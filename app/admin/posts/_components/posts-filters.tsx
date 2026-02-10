'use client';

import { useEffect, useRef, useState } from 'react';
import { Category } from '@/types';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { StatusFilter, SortField, SortOrder, PostsFilterState } from '@/hooks/use-posts-filters';

interface PostsFiltersProps {
    filters: PostsFilterState;
    categories: Category[];
    stats: { total: number; published: number; draft: number; filtered: number };
    hasActiveFilters: boolean;
    onSearchChange: (search: string) => void;
    onStatusChange: (status: StatusFilter) => void;
    onCategoryChange: (categoryId: string) => void;
    onSortFieldChange: (field: SortField) => void;
    onSortOrderChange: (order: SortOrder) => void;
    onReset: () => void;
}

export default function PostsFilters({
    filters,
    categories,
    stats,
    hasActiveFilters,
    onSearchChange,
    onStatusChange,
    onCategoryChange,
    onSortFieldChange,
    onSortOrderChange,
    onReset,
}: PostsFiltersProps) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounce search input
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            onSearchChange(debouncedSearch);
        }, 300);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [debouncedSearch, onSearchChange]);

    const statusOptions: { value: StatusFilter; label: string; count: number }[] = [
        { value: 'all', label: 'الكل', count: stats.total },
        { value: 'published', label: 'منشور', count: stats.published },
        { value: 'draft', label: 'مسودة', count: stats.draft },
    ];

    const sortOptions: { value: SortField; label: string }[] = [
        { value: 'updatedAt', label: 'تاريخ التحديث' },
        { value: 'createdAt', label: 'تاريخ الإنشاء' },
        { value: 'publishedAt', label: 'تاريخ النشر' },
        { value: 'title', label: 'العنوان' },
    ];

    return (
        <div className="space-y-4">
            {/* Search Bar + Mobile Filter Toggle */}
            <div className="flex gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        placeholder="ابحث في العناوين، الوسوم..."
                        value={debouncedSearch}
                        onChange={(e) => setDebouncedSearch(e.target.value)}
                        className="w-full pr-10 pl-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                    {debouncedSearch && (
                        <button
                            onClick={() => { setDebouncedSearch(''); onSearchChange(''); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                {/* Mobile Filters Toggle */}
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className={`lg:hidden flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${hasActiveFilters
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                >
                    <SlidersHorizontal size={16} />
                    <span className="hidden sm:inline">تصفية</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                </button>
            </div>

            {/* Desktop Filters — always visible on lg+ */}
            <div className={`space-y-3 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Status Tabs */}
                    <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onStatusChange(opt.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filters.status === opt.value
                                        ? 'bg-white text-stone-900 shadow-sm'
                                        : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                {opt.label}
                                <span className={`mr-1 text-[10px] ${filters.status === opt.value ? 'text-amber-600' : 'text-stone-400'
                                    }`}>
                                    {opt.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Category Select */}
                    <div className="relative">
                        <select
                            value={filters.categoryId}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="appearance-none bg-white border border-stone-200 rounded-lg px-3 py-1.5 pr-3 pl-8 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                        >
                            <option value="">كل التصنيفات</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>

                    {/* Sort Select */}
                    <div className="relative">
                        <select
                            value={filters.sortField}
                            onChange={(e) => onSortFieldChange(e.target.value as SortField)}
                            className="appearance-none bg-white border border-stone-200 rounded-lg px-3 py-1.5 pr-3 pl-8 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>

                    {/* Sort Order Toggle */}
                    <button
                        onClick={() => onSortOrderChange(filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-all"
                        title={filters.sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                    >
                        {filters.sortOrder === 'desc' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                        )}
                    </button>

                    {/* Reset — only if filters are active */}
                    {hasActiveFilters && (
                        <button
                            onClick={() => { onReset(); setDebouncedSearch(''); }}
                            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all font-medium"
                        >
                            مسح الفلاتر
                        </button>
                    )}
                </div>

                {/* Results count */}
                {hasActiveFilters && (
                    <p className="text-xs text-stone-500">
                        عرض <span className="font-semibold text-stone-700">{stats.filtered}</span> من أصل <span className="font-semibold text-stone-700">{stats.total}</span> مقال
                    </p>
                )}
            </div>
        </div>
    );
}

import { useMemo, useState, useCallback } from 'react';
import { Post, Category } from '@/types';

export type StatusFilter = 'all' | 'published' | 'draft';
export type SortField = 'updatedAt' | 'createdAt' | 'publishedAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface PostsFilterState {
    search: string;
    status: StatusFilter;
    categoryId: string;
    sortField: SortField;
    sortOrder: SortOrder;
}

const defaultFilters: PostsFilterState = {
    search: '',
    status: 'all',
    categoryId: '',
    sortField: 'updatedAt',
    sortOrder: 'desc',
};

export function usePostsFilters(posts: Post[]) {
    const [filters, setFilters] = useState<PostsFilterState>(defaultFilters);

    // Individual setters
    const setSearch = useCallback((search: string) =>
        setFilters(prev => ({ ...prev, search })), []);
    const setStatus = useCallback((status: StatusFilter) =>
        setFilters(prev => ({ ...prev, status })), []);
    const setCategoryId = useCallback((categoryId: string) =>
        setFilters(prev => ({ ...prev, categoryId })), []);
    const setSortField = useCallback((sortField: SortField) =>
        setFilters(prev => ({ ...prev, sortField })), []);
    const setSortOrder = useCallback((sortOrder: SortOrder) =>
        setFilters(prev => ({ ...prev, sortOrder })), []);
    const resetFilters = useCallback(() => setFilters(defaultFilters), []);

    const hasActiveFilters = filters.search !== '' || filters.status !== 'all' || filters.categoryId !== '';

    // Memoized filtering + sorting pipeline
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // 1. Status filter
        if (filters.status === 'published') {
            result = result.filter(p => p.published);
        } else if (filters.status === 'draft') {
            result = result.filter(p => !p.published);
        }

        // 2. Category filter
        if (filters.categoryId) {
            result = result.filter(p => p.categoryId === filters.categoryId);
        }

        // 3. Search filter (title + tags + seo_description)
        if (filters.search.trim()) {
            const query = filters.search.toLowerCase().trim();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(query) ||
                p.seo_description?.toLowerCase().includes(query) ||
                p.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // 4. Sort
        result.sort((a, b) => {
            const order = filters.sortOrder === 'asc' ? 1 : -1;

            if (filters.sortField === 'title') {
                return (a.title || '').localeCompare(b.title || '', 'ar') * order;
            }

            // Timestamp comparison
            const aTime = a[filters.sortField]?.seconds ?? 0;
            const bTime = b[filters.sortField]?.seconds ?? 0;
            return (aTime - bTime) * order;
        });

        return result;
    }, [posts, filters]);

    // Stats
    const stats = useMemo(() => ({
        total: posts.length,
        published: posts.filter(p => p.published).length,
        draft: posts.filter(p => !p.published).length,
        filtered: filteredPosts.length,
    }), [posts, filteredPosts]);

    return {
        filters,
        filteredPosts,
        stats,
        hasActiveFilters,
        setSearch,
        setStatus,
        setCategoryId,
        setSortField,
        setSortOrder,
        resetFilters,
    };
}

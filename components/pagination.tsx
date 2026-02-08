'use client';

import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    // Generate page numbers with ellipsis for many pages
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show around current page
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                rangeWithDots.push(i);
            } else if (rangeWithDots[rangeWithDots.length - 1] !== i - 1) {
                rangeWithDots.push('...');
            }
        }

        // Clean up consecutive ellipsis
        return rangeWithDots.filter((item, index, arr) => {
            return item !== '...' || (index === arr.length - 1) || arr[index + 1] !== '...';
        });
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex justify-center items-center gap-2 mt-8 mb-8" aria-label="Pagination">
            {/* Previous Button */}
            <Link
                href={currentPage > 1 ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage - 1}` : baseUrl}
                className={`px-4 py-2 rounded-[var(--radius-md)] font-medium transition-colors ${currentPage === 1
                        ? 'bg-[var(--color-bg-tertiary)] text-stone-400 cursor-not-allowed opacity-50'
                        : 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary-hover)]'
                    }`}
                aria-disabled={currentPage === 1}
            >
                السابق
            </Link>

            {/* Page Numbers */}
            <div className="flex gap-1">
                {pageNumbers.map((pageNum, index) => (
                    <div key={index}>
                        {pageNum === '...' ? (
                            <span className="px-3 py-2 text-stone-400">...</span>
                        ) : (
                            <Link
                                href={`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${typeof pageNum === 'number' ? pageNum : 1}`}
                                className={`px-3 py-2 rounded-[var(--radius-md)] font-medium transition-colors ${currentPage === pageNum
                                        ? 'bg-[var(--color-accent-primary)] text-white'
                                        : 'bg-[var(--color-bg-tertiary)] text-stone-700 hover:bg-[var(--color-accent-light)]'
                                    }`}
                                aria-current={currentPage === pageNum ? 'page' : undefined}
                            >
                                {pageNum}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Next Button */}
            <Link
                href={currentPage < totalPages ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${currentPage + 1}` : baseUrl}
                className={`px-4 py-2 rounded-[var(--radius-md)] font-medium transition-colors ${currentPage === totalPages
                        ? 'bg-[var(--color-bg-tertiary)] text-stone-400 cursor-not-allowed opacity-50'
                        : 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary-hover)]'
                    }`}
                aria-disabled={currentPage === totalPages}
            >
                التالي
            </Link>
        </nav>
    );
}
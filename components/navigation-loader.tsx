'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Start loading
        setIsLoading(true);
        setIsComplete(false);

        // Complete loading after a short delay
        const timer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsComplete(false);
            }, 300);
        }, 200);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    if (!isLoading) return null;

    return (
        <div
            className={`nav-loader ${isComplete ? 'complete' : 'loading'}`}
            role="progressbar"
            aria-label="جاري تحميل الصفحة"
        />
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logout } from '@/lib/auth';
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Tag,
    ExternalLink,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login');
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    // Close mobile menu on route change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname, isMobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400">جاري التحميل...</div>;
    }

    if (!user) {
        return null;
    }

    const navLinks = [
        { name: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
        { name: 'كل المقالات', href: '/admin/posts', icon: FileText },
        { name: 'التصنيفات', href: '/admin/categories', icon: FolderOpen },
        { name: 'الوسوم', href: '/admin/tags', icon: Tag },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-stone-50 font-sans">

            {/* Mobile Header */}
            <header className="md:hidden bg-stone-900 text-stone-100 p-4 flex justify-between items-center shadow-md z-20 sticky top-0">
                <Link href="/admin" className="font-bold text-lg hover:text-amber-500 transition-colors">لوحة التحكم</Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded hover:bg-stone-800 transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 right-0 w-64 bg-stone-900 text-stone-100 z-30 transform transition-transform duration-300 ease-in-out shadow-xl
                md:relative md:translate-x-0 md:flex md:flex-col md:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}>
                {/* Desktop Header / User Info */}
                <div className="p-6 border-b border-stone-800 hidden md:block">
                    <Link href="/admin" className="font-bold text-lg hover:text-amber-500 transition-colors block">لوحة التحكم</Link>
                    <div className="text-xs text-stone-500 mt-1 truncate" title={user.email || ''}>{user.email}</div>
                </div>

                {/* Mobile User Info */}
                <div className="p-6 border-b border-stone-800 md:hidden">
                    <div className="text-sm text-stone-400">مرحباً،</div>
                    <div className="font-bold truncate">{user.email}</div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        // Simple check for 'All Posts' vs 'Dashboard' if they share href, 
                        // usually we'd want exact match for dashboard, but here they are same.
                        // For styling let's just highlight if exact match.

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${isActive
                                    ? 'bg-amber-900 text-white'
                                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-stone-800">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-3 rounded text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
                        >
                            <ExternalLink size={20} />
                            <span>عرض الموقع</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-stone-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors text-sm"
                    >
                        <LogOut size={20} />
                        <span>تسجيل خروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 w-full">
                {children}
            </main>
        </div>
    );
}

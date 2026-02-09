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
    X,
    Settings,
    BarChart3,
    Home,
    UserCircle
} from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <div className="text-stone-400">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navSections = [
        {
            title: 'الرئيسية',
            items: [
                { name: 'نظرة عامة', href: '/admin', icon: Home },
                { name: 'الإحصائيات', href: '/admin/analytics', icon: BarChart3 },
            ]
        },
        {
            title: 'المحتوى',
            items: [
                { name: 'المقالات', href: '/admin/posts', icon: FileText },
                { name: 'التصنيفات', href: '/admin/categories', icon: FolderOpen },
                { name: 'الوسوم', href: '/admin/tags', icon: Tag },
            ]
        },
        {
            title: 'الإعدادات',
            items: [
                { name: 'الملف الشخصي', href: '/admin/profile', icon: UserCircle },
                { name: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-stone-200 sticky top-0 z-50">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                            aria-label="فتح القائمة الجانبية"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link href="/admin" className="font-bold text-lg text-stone-900">
                            لوحة التحكم
                        </Link>
                    </div>
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <UserCircle size={20} className="text-amber-600" />
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky inset-y-0 right-0 z-50
                bg-white border-l border-stone-200 shadow-elevated
                transform transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? 'w-20' : 'w-72'}
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}>
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between p-6 border-b border-stone-100">
                    <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-full text-center' : ''}`}>
                        <Link 
                            href="/admin" 
                            className="flex items-center gap-3 text-amber-600 hover:text-amber-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <LayoutDashboard size={24} />
                            </div>
                            {!sidebarCollapsed && (
                                <span className="font-bold text-lg">لوحة التحكم</span>
                            )}
                        </Link>
                    </div>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden md:block p-1 rounded hover:bg-stone-100 transition-colors"
                        aria-label="طي/توسيع الشريط الجانبي"
                    >
                        <Menu size={20} className={sidebarCollapsed ? 'rotate-180' : ''} />
                    </button>
                </div>

                {/* Mobile User Info */}
                <div className="md:hidden p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <UserCircle size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="font-medium text-stone-900">مرحباً،</div>
                            <div className="text-sm text-stone-500 truncate">{user.email}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    {navSections.map((section) => (
                        <div key={section.title} className="mb-6">
                            {!sidebarCollapsed && (
                                <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3 px-2">
                                    {section.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg
                                                transition-all duration-200
                                                ${sidebarCollapsed ? 'justify-center' : ''}
                                                ${isActive
                                                    ? 'bg-amber-50 text-amber-700 font-medium shadow-sm'
                                                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                                }
                                                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
                                            `}
                                        >
                                            <Icon size={20} className="flex-shrink-0" />
                                            {!sidebarCollapsed && (
                                                <span className="truncate">{item.name}</span>
                                            )}
                                            {sidebarCollapsed && (
                                                <div className="absolute right-full mr-2 bg-stone-900 text-white text-xs py-1 px-2 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    {item.name}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* External Link */}
                    <div className="pt-4 mt-4 border-t border-stone-100">
                        <Link
                            href="/"
                            target="_blank"
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg
                                text-stone-500 hover:bg-stone-100 hover:text-stone-700
                                transition-all duration-200
                                ${sidebarCollapsed ? 'justify-center' : ''}
                            `}
                        >
                            <ExternalLink size={20} className="flex-shrink-0" />
                            {!sidebarCollapsed && <span>عرض الموقع</span>}
                        </Link>
                    </div>
                </nav>

                {/* User Info & Logout (Desktop) */}
                <div className="hidden md:block p-4 border-t border-stone-100">
                    {!sidebarCollapsed && (
                        <div className="mb-3 px-3">
                            <div className="text-xs text-stone-400 truncate">{user.email}</div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700
                            transition-all duration-200
                            ${sidebarCollapsed ? 'justify-center' : ''}
                            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                        `}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {!sidebarCollapsed && <span>تسجيل خروج</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`
                transition-all duration-300
                ${sidebarCollapsed ? 'md:mr-20' : 'md:mr-72'}
                ${isMobileMenuOpen ? 'mr-0' : 'mr-0 md:mr-0'}
            `}>
                <div className="p-4 md:p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

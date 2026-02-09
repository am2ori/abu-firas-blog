'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'الرئيسية', href: '/' },
        { name: 'جميع المقالات', href: '/blog' },
    ];

    return (
        <header className={`
            sticky top-0 z-50 transition-all duration-300 border-b
            ${isScrolled
                ? 'bg-white/95 backdrop-blur-md border-stone-200 shadow-subtle'
                : 'bg-white/80 backdrop-blur-sm border-transparent'
            }
        `}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="group flex items-center gap-3 transition-all duration-200"
                    aria-label="وميض الكتابة - العودة للرئيسية"
                >
                    <img
                        src="/BlogLofoAbufiras.png"
                        alt="وميض الكتابة"
                        className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                            console.error('Logo failed to load:', e);
                            // Fallback to old logo if new one fails
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.png';
                        }}
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="القائمة الرئيسية">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="
                                px-4 py-2 text-sm font-medium text-stone-600 
                                hover:text-amber-600 hover:bg-amber-50 
                                rounded-lg transition-all duration-200 
                                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                            "
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>



                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="
                        lg:hidden p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 
                        rounded-lg transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                    "
                    aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`
                lg:hidden overflow-hidden transition-all duration-300 bg-white border-t border-stone-200
                ${isMobileMenuOpen ? 'max-h-64' : 'max-h-0'}
            `}>
                <nav className="px-4 py-4 space-y-1" role="navigation" aria-label="القائمة الرئيسية للجوال">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="
                                block px-3 py-2 text-base font-medium text-stone-600 
                                hover:text-amber-600 hover:bg-amber-50 
                                rounded-lg transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                            "
                        >
                            {item.name}
                        </Link>
                    ))}

                </nav>
            </div>
        </header>
    );
}

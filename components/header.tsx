import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/">
                    <img src="/logo.png" alt="وميض الكتابة" className="h-12 w-auto object-contain" />
                </Link>
                <nav className="flex gap-6 text-sm font-medium text-stone-600">
                    <Link href="/blog" className="hover:text-amber-700 transition-colors">
                        جميع المقالات
                    </Link>
                </nav>
            </div>
        </header>
    );
}

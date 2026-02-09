export default function Footer() {
    return (
        <footer className="border-t border-stone-200 py-8 mt-16 bg-white">
            <div className="container mx-auto px-4 text-center section-fade-in">
                <div className="mb-6 flex justify-center">
                    <img src="/BlogLofoAbufiras.png" alt="شعار المدونة" className="h-16 w-auto opacity-80 grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <p className="text-stone-500 text-sm mb-4">
                    جميع الحقوق محفوظة © {new Date().getFullYear()}، عبدالعظيم أبو فراس
                </p>
                <div className="mt-4 pt-4 border-t border-dash border-stone-100">
                    <a
                        href="https://umarali.cc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-amber-900 font-medium transition-colors text-xs"
                    >
                        أنشئ مدونتك الشخصية الآن - تواصل معي
                    </a>
                </div>
            </div>
        </footer>
    );
}

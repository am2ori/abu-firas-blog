'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { stripMarkdown } from '@/lib/seo';
import { timestampToInputString, inputStringToTimestamp, nowToInputString } from '@/lib/date';
import { db } from '@/lib/firebase';
import { Post, Category } from '@/types';
import { getCategories, addCategory } from '@/lib/categories';
import { generateSlug, checkSlugUnique } from '@/lib/slug';
import { validateImageFile } from '@/lib/image';
import TagInput from '@/components/tag-input';




interface PostFormProps {
    post?: Post; // If provided, we are in edit mode
}

export default function PostForm({ post }: PostFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [slugError, setSlugError] = useState('');

    // Form States
    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [isSlugModified, setIsSlugModified] = useState(!!post); // If editing old post, assume modified so we don't overwrite
    const [isSeoTitleModified, setIsSeoTitleModified] = useState(!!post?.seo_title);
    const [isSeoDescModified, setIsSeoDescModified] = useState(!!post?.seo_description);

    const [content, setContent] = useState(post?.contentMarkdown || '');
    const [category, setCategory] = useState(post?.categoryId || '');

    // Categories State
    const [categories, setCategories] = useState<Category[]>([]);
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategorySlug, setNewCategorySlug] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Tags State
    const [tags, setTags] = useState<string[]>(post?.tags || []);

    const [seoTitle, setSeoTitle] = useState(post?.seo_title || '');
    const [seoDesc, setSeoDesc] = useState(post?.seo_description || '');
    const [published, setPublished] = useState(post?.published || false);
    const [createdAt] = useState(post?.createdAt ? timestampToInputString(post.createdAt) : nowToInputString());
    const [publishedAt, setPublishedAt] = useState(post?.publishedAt ? timestampToInputString(post.publishedAt) : '');
    const [imageUrl, setImageUrl] = useState(post?.featuredImageUrl || '');

    // Image System States
    const [imageMode, setImageMode] = useState<'url' | 'file'>(post?.featuredImageUrl ? 'url' : 'file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(post?.featuredImageUrl || '');
    const [fileError, setFileError] = useState('');

    // Fetch Categories on Mount
    useEffect(() => {
        async function fetchCats() {
            const cats = await getCategories();
            setCategories(cats);
            // If no category selected and we have categories, select the first one? 
            // Or let the user choose. If editing, we keep the existing ID.
            if (!category && cats.length > 0 && !post) {
                setCategory(cats[0].id); // Optional: Default to first category
            }
        }
        fetchCats();
    }, [category, post]);

    // Auto-generate slug for new category
    useEffect(() => {
        if (newCategoryName) {
            const slug = generateSlug(newCategoryName);
            setNewCategorySlug(slug);
        }
    }, [newCategoryName]);

    // Handle adding new category
    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) return;

        setIsAddingCategory(true);
        try {
            const categoryId = await addCategory({
                name: newCategoryName.trim(),
                slug: newCategorySlug,
            });

            // Refresh categories list
            const updatedCategories = await getCategories();
            setCategories(updatedCategories);

            // Select the newly added category
            setCategory(categoryId);

            // Reset form
            setNewCategoryName('');
            setNewCategorySlug('');
            setShowNewCategoryForm(false);
        } catch (error) {
            console.error('Error adding category:', error);
            alert('حدث خطأ أثناء إضافة التصنيف. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsAddingCategory(false);
        }
    };

    // Auto-generate slug from title
    useEffect(() => {
        if (!isSlugModified && title) {
            const newSlug = generateSlug(title);
            setSlug(newSlug);
        }
    }, [title, isSlugModified]);

    // Auto-fill SEO Title
    useEffect(() => {
        if (!isSeoTitleModified && title) {
            setSeoTitle(title);
        }
    }, [title, isSeoTitleModified]);

    // Auto-fill SEO Description
    useEffect(() => {
        if (!isSeoDescModified && content) {
            const plainText = stripMarkdown(content);
            setSeoDesc(plainText.slice(0, 160));
        }
    }, [content, isSeoDescModified]);

    // Handle Slug Change Manually
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setIsSlugModified(true);
        setSlugError('');
    };

    // Check Slug Uniqueness on Blur (optional) or just on Submit? User asked for validation.
    // Let's check on blur for better UX.
    const handleSlugBlur = async () => {
        if (!slug) return;
        const isUnique = await checkSlugUnique('posts', slug, post?.id);
        if (!isUnique) {
            setSlugError('⚠️ هذا الرابط مستخدم بالفعل لمقال آخر. يرجى تغييره.');
        } else {
            setSlugError('');
        }
    };

    // Tag Handlers
    const handleSeoTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSeoTitle(val);
        setIsSeoTitleModified(val.length > 0);
    };

    const handleSeoDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setSeoDesc(val);
        setIsSeoDescModified(val.length > 0);
    };

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };

    const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isPublished = e.target.checked;
        setPublished(isPublished);
        if (isPublished && !publishedAt) {
            setPublishedAt(nowToInputString());
        }
    };

    // Image System Handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError('');

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl('');
            return;
        }

        const validation = validateImageFile(file);
        if (!validation.valid) {
            setFileError(validation.error || 'ملف غير صالح');
            e.target.value = ''; // Reset input
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setImageUrl(''); // Clear URL input when file is selected
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setPreviewUrl(url); // Should we validate here? Maybe just show what they type.
        setSelectedFile(null); // Clear file if typing URL? Or just rely on mode?
        // Let's rely on mode, but preview follows input.
    }

    const toggleImageMode = (mode: 'url' | 'file') => {
        setImageMode(mode);
        setFileError('');
        // When switching, update preview based on what's available in that mode
        if (mode === 'url') {
            setPreviewUrl(imageUrl);
        } else {
            setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : '');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSlugError('');

        // Final Slug Validation
        const isUnique = await checkSlugUnique('posts', slug, post?.id);
        if (!isUnique) {
            setSlugError('⚠️ هذا الرابط مستخدم بالفعل. لا يمكن حفظ المقال.');
            setLoading(false);
            return;
        }

        try {
            const postData: Partial<Post> = {
                title,
                slug,
                // ...
                contentMarkdown: content,
                categoryId: category, // Saves the Category ID
                tags: tags, // Use array directly
                seo_title: seoTitle,
                seo_description: seoDesc,
                published,
                featuredImageUrl: imageUrl || null,
                updatedAt: Timestamp.now(),
                createdAt: inputStringToTimestamp(createdAt) || Timestamp.now(),
                publishedAt: inputStringToTimestamp(publishedAt) || null,
            };

            if (!post) {
                // Create New
                // createdAt is already set in postData above
                // publishedAt is also set above
                await addDoc(collection(db, 'posts'), postData);
            } else {
                // Update Existing
                // We don't overwrite createdAt for existing posts usually, but user specified "editable".
                // So we update it if they changed it.
                await updateDoc(doc(db, 'posts', post.id), postData);
            }

            router.push('/admin');
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                const errorCode = (err as { code?: string }).code;
                if (errorCode === 'permission-denied' || err.message.includes('permission')) {
                    setError('⛔ ليس لديك صلاحية لحفظ المقال. تأكد من تسجيل الدخول كمسؤول.');
                } else if (err.message.includes('offline') || errorCode === 'unavailable') {
                    setError('📡 لا يوجد اتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.');
                } else if (err.message.includes('quota')) {
                    setError('⚠️ تم تجاوز الحد المسموح. تواصل مع الدعم الفني.');
                } else {
                    setError(`❌ حدث خطأ غير متوقع: ${err.message}`);
                }
            } else {
                setError('❌ حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-stone-800">
                    {post ? 'تعديل مقال' : 'مقال جديد'}
                </h1>
                <div className="flex items-center gap-4">
                    {/* Header Publish Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={handlePublishedChange}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className={`font-medium ${published ? 'text-green-600' : 'text-stone-500'}`}>
                            {published ? 'منشور' : 'مسودة'}
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-amber-900 text-white px-6 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">عنوان المقال</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            placeholder="عنوان جذاب..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">الرابط (Slug)</label>
                        <input
                            type="text"
                            required
                            value={slug}
                            onChange={handleSlugChange}
                            onBlur={handleSlugBlur}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-amber-500 focus:border-amber-500 outline-none bg-stone-50 text-stone-600 ltr text-right ${slugError ? 'border-red-500' : 'border-stone-200'}`}
                            dir="ltr"
                        />
                        {slugError ? (
                            <p className="text-red-500 text-xs mt-1">{slugError}</p>
                        ) : (
                            !isSlugModified && <p className="text-xs text-stone-400 mt-1 italic">✨ يتم إنشاء الرابط تلقائياً من عنوان المقال</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">المحتوى (Markdown)</label>
                        <textarea
                            required
                            rows={15}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-sm leading-relaxed"
                            placeholder="# اكتب هنا..."
                        />
                    </div>

                    {/* SEO Section - Moved to Main Column */}
                    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-stone-800 border-b pb-2 flex items-center gap-2">
                            <span>🚀 تحسين محركات البحث SEO</span>
                        </h3>

                        {/* SEO Title */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-medium text-stone-700">عنوان SEO</label>
                                <span className={`text-xs ${seoTitle.length > 60 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                                    {seoTitle.length}/60
                                </span>
                            </div>
                            <input
                                type="text"
                                value={seoTitle}
                                onChange={handleSeoTitleChange}
                                className={`w-full px-3 py-2 rounded border text-sm transition-colors ${seoTitle.length > 60 ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-stone-200 focus:border-amber-500 focus:ring-amber-200'
                                    }`}
                                placeholder="عنوان يظهر في نتائج البحث..."
                            />
                            {!isSeoTitleModified && <p className="text-xs text-stone-400 mt-1 italic">✨ يتم التوليد تلقائياً من عنوان المقال</p>}
                        </div>

                        {/* SEO Description */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-medium text-stone-700">وصف SEO</label>
                                <span className={`text-xs ${seoDesc.length > 160 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                                    {seoDesc.length}/160
                                </span>
                            </div>
                            <textarea
                                rows={3}
                                value={seoDesc}
                                onChange={handleSeoDescChange}
                                className={`w-full px-3 py-2 rounded border text-sm transition-colors ${seoDesc.length > 160 ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-stone-200 focus:border-amber-500 focus:ring-amber-200'
                                    }`}
                                placeholder="وصف مختصر يظهر تحت العنوان في نتائج البحث..."
                            />
                            {!isSeoDescModified && <p className="text-xs text-stone-400 mt-1 italic">✨ يتم التوليد تلقائياً من محتوى المقال</p>}
                        </div>

                        {/* Google Preview Snippet */}
                        <div className="mt-4 p-4 bg-stone-50 rounded border border-stone-100 hidden sm:block">
                            <p className="text-xs text-stone-500 mb-2">معاينة تقريبية في Google:</p>
                            <div className="font-sans text-left" dir="ltr">
                                <div className="text-sm text-[#202124] flex items-center gap-1">
                                    <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center text-[10px]">Logo</div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[#202124]">Abu Firas Blog</span>
                                        <span className="text-[#5f6368] text-xs">https://blog.abufiras.com › posts</span>
                                    </div>
                                </div>
                                <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mt-1">
                                    {seoTitle || title || 'Post Title'}
                                </div>
                                <div className="text-sm text-[#4d5156] break-words line-clamp-2 mt-1">
                                    {seoDesc || 'This is the description that will appear in search results...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    {/* Publishing & Dates Card */}
                    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-stone-800 border-b pb-2">تاريخ المقال</h3>

                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">تاريخ التدوينة</label>
                                <input
                                    type="datetime-local"
                                    value={publishedAt}
                                    onChange={(e) => setPublishedAt(e.target.value)}
                                    className="w-full px-3 py-2 rounded border border-stone-200 text-sm ltr text-right"
                                    dir="ltr"
                                />
                                {published && !publishedAt && (
                                    <p className="text-xs text-primary mt-1">سيتم تعيينه تلقائياً عند الحفظ</p>
                                )}
                                {!published && (
                                    <p className="text-xs text-stone-400 mt-1">تاريخ النشر محفوظ كمسودة</p>
                                )}
                            </div>

                            {/* Hidden CreatedAt Input - Logic Preserved */}
                            <input type="hidden" value={createdAt} />
                        </div>
                    </div>

                    {/* Organization Card (Categories & Tags) */}
                    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-stone-800 border-b pb-2">التصنيف والوسوم</h3>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">التصنيف</label>
                            {categories.length > 0 ? (
                                <div className="space-y-2">
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                setShowNewCategoryForm(true);
                                            } else {
                                                setCategory(e.target.value);
                                                setShowNewCategoryForm(false);
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    >
                                        <option value="" disabled>اختر تصنيفاً...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                        <option value="new" className="text-primary-dark font-medium">
                                            + إضافة تصنيف جديد
                                        </option>
                                    </select>
                                </div>
                            ) : (
                                <div className="text-sm text-stone-500 border border-stone-200 rounded p-2 bg-stone-50">
                                    جاري تحميل التصنيفات...
                                </div>
                            )}

                            {/* New Category Form */}
                            {showNewCategoryForm && (
                                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                                    <h4 className="text-sm font-medium text-amber-900">إضافة تصنيف جديد</h4>

                                    <div>
                                        <label className="block text-xs font-medium text-stone-700 mb-1">اسم التصنيف</label>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="w-full px-3 py-2 rounded border border-amber-200 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                                            placeholder="مثال: التقنية، السفر..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-stone-700 mb-1">الرابط (Slug)</label>
                                        <input
                                            type="text"
                                            value={newCategorySlug}
                                            onChange={(e) => setNewCategorySlug(e.target.value)}
                                            className="w-full px-3 py-2 rounded border border-amber-200 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm bg-stone-50 text-stone-600 ltr text-right"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddNewCategory}
                                            disabled={isAddingCategory || !newCategoryName.trim()}
                                            className="px-3 py-1.5 bg-primary-dark text-white rounded text-sm hover:bg-primary-dark/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isAddingCategory ? 'جاري الإضافة...' : 'إضافة التصنيف'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewCategoryForm(false);
                                                setNewCategoryName('');
                                                setNewCategorySlug('');
                                            }}
                                            className="px-3 py-1.5 bg-stone-300 text-stone-700 rounded text-sm hover:bg-stone-400"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">الوسوم</label>
                            <TagInput
                                selectedTags={tags}
                                onTagsChange={handleTagsChange}
                                placeholder="أضف وسماً..."
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-stone-800 border-b pb-2">الصورة البارزة</h3>

                        {/* Image Mode Tabs */}
                        <div className="flex p-1 bg-stone-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => toggleImageMode('url')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${imageMode === 'url' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                رابط خارجي
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleImageMode('file')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${imageMode === 'file' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                رفع ملف
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Preview Area */}
                            {previewUrl ? (
                                <div className="relative group">
                                    <img
                                        src={previewUrl}
                                        alt="Post preview"
                                        className="w-full h-48 object-cover rounded-md bg-stone-50 border border-stone-100"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                        onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                    />
                                    {/* Clear Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewUrl('');
                                            setImageUrl('');
                                            setSelectedFile(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="حذف الصورة"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-sm">
                                    لا توجد صورة محددة
                                </div>
                            )}

                            {/* Inputs based on Mode */}
                            {imageMode === 'url' ? (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">رابط الصورة</label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={handleUrlChange}
                                        className="w-full px-3 py-2 rounded border border-stone-200 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
                                        placeholder="https://example.com/image.jpg"
                                        dir="ltr"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">اختر ملف من جهازك</label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleFileSelect}
                                        className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/5 file:text-primary-dark hover:file:bg-primary/10"
                                    />
                                    {fileError && (
                                        <p className="text-red-500 text-xs mt-1">{fileError}</p>
                                    )}
                                    <p className="text-xs text-stone-400 mt-1">
                                        الحجم الأقصى: 5MB. الصيغ المدعومة: JPG, PNG, WebP
                                    </p>
                                    {selectedFile && (
                                        <p className="text-xs text-primary mt-2 font-medium">
                                            ⚠️ ملاحظة: سيتم رفع الصورة عند توفير خدمة التخزين السحابي لاحقاً.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}

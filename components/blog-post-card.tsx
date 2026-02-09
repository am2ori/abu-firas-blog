/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Post } from "@/types";
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

interface BlogPostCardProps {
    post: Partial<Post>;
    categoryName?: string;
}

export default function BlogPostCard({ post, categoryName }: BlogPostCardProps) {
    const imageSrc = post.featuredImageUrl;
    const isPublished = post.published;
    const publishDate = post.publishedAt ? new Date(post.publishedAt.seconds * 1000) : null;

    return (
        <article className="
            group flex flex-col bg-white rounded-2xl overflow-hidden
            border border-stone-200 hover:border-amber-300
            shadow-subtle hover:shadow-card
            transition-all-300 h-full
            focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2
        ">
            {/* Image Section - Only render if image exists */}
            {imageSrc && (
                <div className="relative h-48 sm:h-56 overflow-hidden">
                    <Link 
                        href={`/blog/${post.slug || post.id}`} 
                        className="block w-full h-full"
                        aria-label={`اقرأ مقال: ${post.title}`}
                    >
                        <img
                            src={imageSrc}
                            alt={post.title || 'صورة المقال'}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${isPublished 
                                ? 'bg-green-500 text-white' 
                                : 'bg-amber-500 text-white'
                            }
                        `}>
                            {isPublished ? (
                                <>
                                    <Clock size={12} />
                                    منشور
                                </>
                            ) : (
                                <>
                                    <Calendar size={12} />
                                    مسودة
                                </>
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="flex-1 flex flex-col p-6">
                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                    <div className="flex items-center gap-2" dir="ltr">
                        <Calendar size={14} />
                        {publishDate ? (
                            <time dateTime={publishDate.toISOString()}>
                                {publishDate.toLocaleDateString("ar-EG", {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </time>
                        ) : (
                            "مسودة"
                        )}
                    </div>
                    
                    {categoryName && (
                        <Link
                            href={post.categoryId ? `/blog/category/${post.categoryId}` : '/blog'}
                            className="
                                inline-flex items-center gap-1 px-2 py-1 rounded-full
                                bg-amber-100 text-amber-800 hover:bg-amber-200 
                                transition-colors duration-200
                                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
                            "
                        >
                            {categoryName}
                        </Link>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-stone-900 mb-3 leading-tight">
                    <Link 
                        href={`/blog/${post.slug || post.id}`}
                        className="
                            hover:text-amber-700 transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded
                        "
                    >
                        {post.title}
                    </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {post.seo_description || "لا يوجد وصف مختصر..."}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map(tag => (
                            <Link
                                key={tag}
                                href={`/blog?tag=${encodeURIComponent(tag)}`}
                                className="
                                    inline-flex items-center text-xs text-stone-500 
                                    bg-stone-100 hover:bg-amber-100 hover:text-amber-900 
                                    px-2 py-1 rounded-md transition-all duration-200
                                    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
                                "
                            >
                                #{tag}
                            </Link>
                        ))}
                        {post.tags.length > 3 && (
                            <span className="text-xs text-stone-400 px-2 py-1">
                                +{post.tags.length - 3} أخرى
                            </span>
                        )}
                    </div>
                )}

                {/* Read More Link */}
                <div className="mt-auto">
                    <Link
                        href={`/blog/${post.slug || post.id}`}
                        className="
                            inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 
                            font-medium text-sm transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded
                        "
                    >
                        تابع القراءة
                        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

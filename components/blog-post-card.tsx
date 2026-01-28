/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Post } from "@/types";

interface BlogPostCardProps {
    post: Partial<Post>;
    categoryName?: string;
}

export default function BlogPostCard({ post, categoryName }: BlogPostCardProps) {
    const imageSrc = post.featuredImageUrl;

    return (
        <article className="group flex flex-col sm:flex-row gap-6 items-start bg-white p-4 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200 h-full">
            {/* Image Section - Only render if image exists */}
            {imageSrc && (
                <Link href={`/blog/${post.slug || post.id}`} className="shrink-0 w-full sm:w-48 h-48 block overflow-hidden rounded-xl relative order-last sm:order-first">
                    <img
                        src={imageSrc}
                        alt={post.title || 'Post Image'}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                </Link>
            )}

            {/* Content Section */}
            <div className="flex-1 flex flex-col h-full justify-center">
                <div className="flex items-center gap-2 text-xs text-amber-900 font-medium mb-2">
                    <span className="text-stone-500" dir="ltr">
                        {post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString("ar-EG") : "مسودة"}
                    </span>
                    <span className="text-stone-300">•</span>
                    {/* Category Label */}
                    <span className="bg-amber-100 px-2 py-1 rounded text-amber-800 hover:bg-amber-200 transition-colors">
                        <Link href={post.categoryId ? `/blog/category/${post.categoryId}` : '/blog'}>
                            {categoryName || 'مقالة'}
                        </Link>
                    </span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 mb-2 leading-snug group-hover:text-amber-800 transition-colors">
                    <Link href={`/blog/${post.slug || post.id}`}>
                        {post.title}
                    </Link>
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 md:line-clamp-2 mb-3">
                    {post.seo_description || "لا يوجد وصف مختصر..."}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {post.tags.slice(0, 3).map(tag => (
                            <Link
                                key={tag}
                                href={`/blog?tag=${encodeURIComponent(tag)}`}
                                className="text-xs text-stone-400 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 px-2 py-0.5 rounded transition-colors"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

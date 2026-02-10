import Image from "next/image";
import { Post } from "@/types";

interface SuggestedPostsProps {
    suggestedPosts: Post[];
}

export default function SuggestedPosts({ suggestedPosts }: SuggestedPostsProps) {
    if (suggestedPosts.length === 0) return null;

    return (
        <section className="mt-16 pt-12 border-t border-stone-200">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">مقالات مقترحة</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {suggestedPosts.map((post) => (
                    <article
                        key={post.id}
                        className="group bg-white rounded-lg border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                        <a href={`/blog/${post.slug}`} className="block">
                            {post.featuredImageUrl && (
                                <div className="relative aspect-video overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.featuredImageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex gap-2 text-sm text-stone-500 mb-3">
                                    <span>{new Date(post.publishedAt!.seconds * 1000).toLocaleDateString("ar-EG")}</span>
                                    <span>•</span>
                                    <span className="text-amber-800 font-medium">السفر والترحال</span>
                                </div>

                                <h3 className="text-lg font-bold text-stone-900 leading-tight mb-3 group-hover:text-amber-800 transition-colors">
                                    {post.title}
                                </h3>

                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {post.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs">
                                                +{post.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
}
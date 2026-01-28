import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownViewerProps {
    content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
    return (
        <article className="prose prose-lg prose-stone max-w-none dark:prose-invert font-sans">
            <ReactMarkdown
                rehypePlugins={[rehypeSanitize]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-stone-900" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-stone-800" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-stone-700" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 pr-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 pr-4" {...props} />,
                    a: ({ node, ...props }) => <a className="text-amber-700 hover:underline" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-r-4 border-amber-500 pr-4 italic bg-stone-50 py-2 my-6 text-stone-600" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}

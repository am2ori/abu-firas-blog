/**
 * Strips Markdown syntax from a string to get plain text.
 * Enhanced to handle common markdown elements like headers, bold, links, etc.
 */
export function stripMarkdown(markdown: string): string {
    if (!markdown) return '';

    let text = markdown;

    // Remove headers (# Header)
    text = text.replace(/^#+\s+/gm, '');

    // Remove bold/italic (*text* or **text**)
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    // Remove links ([text](url))
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images (![alt](url))
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

    // Remove blockquotes (> text)
    text = text.replace(/^>\s+/gm, '');

    // Remove code blocks (```code```)
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '$1');

    // Remove distinct horizontal rules (---)
    text = text.replace(/^---$/gm, '');

    // Collapse multiple spaces/newlines
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

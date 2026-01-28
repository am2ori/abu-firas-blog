
/**
 * Validates if the given string looks like a valid image URL.
 * Checks for standard image extensions or data URIs.
 */
export function isValidImageUrl(url: string): boolean {
    if (!url) return false;
    // Simple regex for common image extensions or data URI
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) || /^data:image\//i.test(url) || /^https?:\/\/.*images.*/i.test(url);
}

/**
 * Validates a file for size and type.
 * Max size: 5MB
 * Allowed types: jpg, jpeg, png, webp
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'صيغة الملف غير مدعومة. يرجى اختيار JPG, PNG, أو WebP.' };
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return { valid: false, error: `حجم الملف كبير جداً. الحد الأقصى هو ${MAX_SIZE_MB} ميجابايت.` };
    }

    return { valid: true };
}

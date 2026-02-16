'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag } from '@/types';
import { getTags } from '@/lib/tags';

interface TagInputProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ selectedTags, onTagsChange, placeholder = "أضف وسماً..." }: TagInputProps) {
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load available tags
    useEffect(() => {
        const loadTags = async () => {
            setLoading(true);
            try {
                const tags = await getTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error('Error loading tags:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTags();
    }, []);

    // Filter suggestions based on current input
    useEffect(() => {
        if (!currentTag.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = availableTags.filter(tag =>
            tag.name.toLowerCase().includes(currentTag.toLowerCase()) &&
            !selectedTags.includes(tag.name)
        );

        setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
    }, [currentTag, availableTags, selectedTags]);

    const handleAddTag = (tagToAdd: string) => {
        const trimmedTag = tagToAdd.trim();
        if (!trimmedTag || selectedTags.includes(trimmedTag)) return;

        onTagsChange([...selectedTags, trimmedTag]);
        setCurrentTag('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(selectedTags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length > 0 && showSuggestions) {
                handleAddTag(suggestions[0].name);
            } else {
                handleAddTag(currentTag);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (tag: Tag) => {
        handleAddTag(tag.name);
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm border border-amber-100"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary/20 text-primary-dark leading-none pb-0.5"
                            title="حذف الوسم"
                        >
                            ×
                        </button>
                    </span>
                ))}
                {selectedTags.length === 0 && (
                    <span className="text-xs text-stone-400 italic">لا توجد وسوم مضافة</span>
                )}
            </div>

            <div className="relative">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        className="flex-1 min-w-0 px-3 py-2 rounded border border-stone-200 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={() => handleAddTag(currentTag)}
                        disabled={!currentTag.trim()}
                        className="px-3 py-2 bg-stone-100 text-stone-600 rounded hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {suggestions.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleSuggestionClick(tag)}
                                className="w-full px-3 py-2 text-right hover:bg-stone-50 transition-colors text-sm flex items-center justify-between"
                            >
                                <span className="font-medium">#{tag.name}</span>
                                <span className="text-xs text-stone-400 ltr" dir="ltr">{tag.slug}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg p-3 text-center text-sm text-stone-500">
                        جاري تحميل الوسوم...
                    </div>
                )}
            </div>

            {/* Helper Text */}
            <p className="text-xs text-stone-400 mt-2">
                اكتب اسم الوسم واضغط Enter، أو اختر من الاقتراحات المتاحة
            </p>
        </div>
    );
}
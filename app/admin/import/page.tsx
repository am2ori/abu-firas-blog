"use client";

import { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { clsx } from "clsx";

interface CsvPost {
    ID: string;
    "old url": string;
    title: string;
    content: string;
    date: string;
    category: string;
    tags: string;
    slug: string;
}

export default function ImportPostsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setLogs([]);
            setProgress(0);
        }
    };

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    const processImport = async () => {
        if (!file) return;

        setImporting(true);
        setLogs([]);
        setError(null);

        // Note: Browser handles encoding based on file content. 
        // If file is not UTF-8, characters might be garbled.

        Papa.parse<CsvPost>(file, {
            header: true,
            skipEmptyLines: "greedy", // Skip lines that are just whitespace
            encoding: "UTF-8", // Try to force UTF-8 reading if supported by library version/environment
            complete: async (results) => {
                try {
                    const rows = results.data;
                    const total = rows.length;
                    addLog(`تم العثور على ${total} تدوينة في الملف.`);

                    let processed = 0;

                    for (const row of rows) {
                        // 1. Handle Slug Cleanup (Remove leading/trailing slashes, trim, lowercase)
                        let cleanSlug = row.slug?.trim().toLowerCase() || "";
                        if (cleanSlug) {
                            // Remove leading and trailing slashes
                            cleanSlug = cleanSlug.replace(/^\/+|\/+$/g, '');
                            // Decode URI component just in case
                            try { cleanSlug = decodeURIComponent(cleanSlug); } catch (e) { }
                        }

                        if (!row.title || !cleanSlug) {
                            addLog(`تخطي صف غير صالح (بدون عنوان أو رابط): ${JSON.stringify(row)}`);
                            processed++;
                            setProgress(Math.round((processed / total) * 100));
                            continue;
                        }

                        // 1. Handle Category
                        let categoryId = "";
                        // Clean category name: remove quotes, trim, normalize spaces
                        const categoryName = row.category?.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, ' ') || "Uncategorized";

                        // Check if category exists
                        const catsRef = collection(db, "categories");
                        const qCat = query(catsRef, where("name", "==", categoryName));
                        const catSnap = await getDocs(qCat);

                        if (!catSnap.empty) {
                            categoryId = catSnap.docs[0].id;
                        } else {
                            // Create new category
                            const newCatRef = await addDoc(catsRef, {
                                name: categoryName,
                                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                                description: `Imported category: ${categoryName}`,
                                createdAt: serverTimestamp(),
                            });
                            categoryId = newCatRef.id;
                            addLog(`تم إنشاء تصنيف جديد: ${categoryName}`);
                        }

                        // 2. Handle Tags
                        const tagNamesCleaned: string[] = [];
                        // Clean tags: split by comma, trim, remove quotes, filter empty
                        const tagNamesRaw = row.tags
                            ? row.tags.split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(t => t)
                            : [];

                        for (const tagName of tagNamesRaw) {
                            // Check if tag exists (to avoid duplicates in DB, though we store names in Post)
                            const tagsRef = collection(db, "tags");
                            const qTag = query(tagsRef, where("name", "==", tagName));
                            const tagSnap = await getDocs(qTag);

                            if (tagSnap.empty) {
                                await addDoc(tagsRef, {
                                    name: tagName,
                                    slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                                });
                                addLog(`تم إنشاء وسم جديد: ${tagName}`);
                            }
                            tagNamesCleaned.push(tagName);
                        }

                        // 3. Prepare Post Data
                        const publishedDate = row.date ? new Date(row.date) : new Date();
                        const seoDescription = row.content
                            ? row.content.replace(/[#*`]/g, '').slice(0, 155).trim() + "..."
                            : "";

                        // Check if slug exists
                        const postsRef = collection(db, "posts");
                        const qSlug = query(postsRef, where("slug", "==", cleanSlug));
                        const slugSnap = await getDocs(qSlug);

                        if (!slugSnap.empty) {
                            addLog(`تنبيه: التدوينة ذات الرابط "${cleanSlug}" موجودة بالفعل. تم التخطي.`);
                        } else {
                            await addDoc(postsRef, {
                                title: row.title.trim(),
                                slug: cleanSlug,
                                contentMarkdown: row.content,
                                categoryId: categoryId,
                                tags: tagNamesCleaned, // Store NAMES, not IDs
                                published: true,
                                publishedAt: Timestamp.fromDate(publishedDate),
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                                seo_title: row.title,
                                seo_description: seoDescription,
                                featuredImageUrl: null, // No image in CSV
                            });
                            addLog(`تم استيراد: ${row.title}`);
                        }

                        processed++;
                        setProgress(Math.round((processed / total) * 100));
                    }

                    addLog("✅ اكتمل الاستيراد بنجاح!");

                } catch (err: any) {
                    console.error("Import error:", err);
                    setError(err.message || "حدث خطأ غير متوقع أثناء الاستيراد");
                } finally {
                    setImporting(false);
                }
            },
            error: (err) => {
                setError(`خطأ في قراءة ملف CSV: ${err.message}`);
                setImporting(false);
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">استيراد التدوينات</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ملف CSV (تأكد من وجود الأعمدة المطلوبة وأن الترميز UTF-8)
                    </label>
                    <div className={clsx(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        file ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    )}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                            disabled={importing}
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                            {file ? (
                                <>
                                    <FileText className="w-10 h-10 text-green-500 mb-2" />
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{file.name}</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                    <span className="text-gray-600 dark:text-gray-400">اضغط لرفع ملف CSV</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                <button
                    onClick={processImport}
                    disabled={!file || importing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {importing ? (
                        <>
                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                            جاري الاستيراد... {progress}%
                        </>
                    ) : (
                        "بدء الاستيراد"
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 ml-2 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {logs.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto font-mono text-sm">
                    <h3 className="font-bold mb-4 text-gray-700 dark:text-gray-300">سجل العمليات:</h3>
                    <ul className="space-y-1">
                        {logs.map((log, i) => (
                            <li key={i} className="text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 last:border-0 pb-1">
                                {log}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

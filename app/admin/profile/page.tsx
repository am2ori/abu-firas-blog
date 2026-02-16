'use client';

import { useEffect, useState } from 'react';
import { getHomeSettings, updateHomeSettings, HomeSettings } from '@/lib/settings';
import {
    User,
    Save,
    Eye,
    Globe,
    Twitter,
    Facebook,
    Linkedin,
    Github,
    Camera,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
    const [settings, setSettings] = useState<HomeSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getHomeSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'فشل في تحميل الإعدادات' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setMessage(null);

        try {
            const success = await updateHomeSettings({
                authorInfo: settings.authorInfo,
                homeVisibility: settings.homeVisibility,
                heroContent: settings.heroContent,
                socialLinks: settings.socialLinks
            });

            if (success) {
                setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
            } else {
                setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const updateAuthorInfo = (field: keyof HomeSettings['authorInfo'], value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            authorInfo: {
                ...settings.authorInfo,
                [field]: value
            }
        });
    };

    const updateVisibility = (field: keyof HomeSettings['homeVisibility'], value: boolean) => {
        if (!settings) return;
        setSettings({
            ...settings,
            homeVisibility: {
                ...settings.homeVisibility,
                [field]: value
            }
        });
    };

    const updateHeroContent = (field: keyof HomeSettings['heroContent'], value: string | { text: string; url: string }) => {
        if (!settings) return;
        setSettings({
            ...settings,
            heroContent: {
                ...settings.heroContent,
                [field]: value
            }
        });
    };

    const updateSocialLink = (platform: string, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            socialLinks: {
                ...settings.socialLinks,
                [platform]: value
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <div className="text-stone-400">جاري تحميل الإعدادات...</div>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="bg-red-50 text-red-800 p-8 rounded-xl border border-red-200 text-center">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">فشل في تحميل الإعدادات</h2>
                <button
                    onClick={fetchSettings}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900 mb-2">الملف الشخصي والرئيسية</h1>
                <p className="text-stone-600">تحكم بمعلوماتك الشخصية ومحتوى الصفحة الرئيسية</p>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Author Information */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        معلومات الكاتب
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                value={settings.authorInfo.name}
                                onChange={(e) => updateAuthorInfo('name', e.target.value)}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="أدخل اسمك الكامل"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                المسمى الوظيفي
                            </label>
                            <input
                                type="text"
                                value={settings.authorInfo.role}
                                onChange={(e) => updateAuthorInfo('role', e.target.value)}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="مثال: كاتب ومفكر"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            السيرة الذاتية
                        </label>
                        <textarea
                            value={settings.authorInfo.bio}
                            onChange={(e) => updateAuthorInfo('bio', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="اكتب سيرتك الذاتية..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            رابط الصورة الشخصية (اختياري)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={settings.authorInfo.photo || ''}
                                onChange={(e) => updateAuthorInfo('photo', e.target.value)}
                                className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="https://example.com/photo.jpg"
                            />
                            <button className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-2">
                                <Camera size={16} />
                                تحميل
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Home Page Visibility */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <Eye size={20} className="text-primary" />
                        عرض الصفحة الرئيسية
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        {
                            key: 'showHero' as const,
                            label: 'عرض قسم البانر (Hero)',
                            description: 'عرض قسم الترحيب والعنوان الرئيسي في الصفحة الرئيسية'
                        },
                        {
                            key: 'showLatestPostsSection' as const,
                            label: 'عرض قسم آخر المقالات',
                            description: 'عرض قائمة المقالات الأخيرة في الصفحة الرئيسية'
                        }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                            <div>
                                <h3 className="font-medium text-stone-900">{item.label}</h3>
                                <p className="text-sm text-stone-600">{item.description}</p>
                            </div>
                            <button
                                onClick={() => updateVisibility(item.key, !settings.homeVisibility[item.key])}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.homeVisibility[item.key] ? 'bg-primary' : 'bg-stone-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.homeVisibility[item.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero Content */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <Globe size={20} className="text-primary" />
                        محتوى البانر الرئيسي
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            العنوان الرئيسي
                        </label>
                        <input
                            type="text"
                            value={settings.heroContent.heroTitle}
                            onChange={(e) => updateHeroContent('heroTitle', e.target.value)}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="أنا عبدالعظيم أبو فراس"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            النص الفرعي
                        </label>
                        <textarea
                            value={settings.heroContent.heroSubtitle}
                            onChange={(e) => updateHeroContent('heroSubtitle', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="نص وصفي قصير..."
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                نص الزر (اختياري)
                            </label>
                            <input
                                type="text"
                                value={settings.heroContent.ctaButton?.text || ''}
                                onChange={(e) => updateHeroContent('ctaButton', {
                                    ...settings.heroContent.ctaButton,
                                    text: e.target.value,
                                    url: settings.heroContent.ctaButton?.url || '/blog'
                                })}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="استكشف المقالات"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                رابط الزر (اختياري)
                            </label>
                            <input
                                type="url"
                                value={settings.heroContent.ctaButton?.url || ''}
                                onChange={(e) => updateHeroContent('ctaButton', {
                                    ...settings.heroContent.ctaButton,
                                    text: settings.heroContent.ctaButton?.text || 'استكشف المقالات',
                                    url: e.target.value
                                })}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="/blog"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <Twitter size={20} className="text-primary" />
                        روابط التواصل الاجتماعي
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { key: 'twitter', label: 'تويتر/X', icon: Twitter },
                        { key: 'facebook', label: 'فيسبوك', icon: Facebook },
                        { key: 'linkedin', label: 'لينكدإن', icon: Linkedin },
                        { key: 'github', label: 'جيت هب', icon: Github }
                    ].map((social) => {
                        const Icon = social.icon;
                        return (
                            <div key={social.key}>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    {social.label}
                                </label>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon size={18} className="text-stone-600" />
                                    </div>
                                    <input
                                        type="url"
                                        value={settings.socialLinks?.[social.key as keyof typeof settings.socialLinks] || ''}
                                        onChange={(e) => updateSocialLink(social.key, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder={`https://${social.key}.com/username`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            حفظ الإعدادات
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
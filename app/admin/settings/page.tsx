'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAppearanceSettings, getAccountSettings, getSystemSettings, updateAppearanceSettings, updateAccountSettings, updateSystemSettings, AppearanceSettings, AccountSettings, SystemSettings } from '@/lib/settings';
import { auth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import {
    Palette,
    User,
    Mail,
    Settings as SettingsIcon,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Lock,
    Globe,
    Bell
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'notifications' | 'system'>('appearance');
    const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);
    const [accountSettings, setAccountSettings] = useState<AccountSettings | null>(null);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchAllSettings();
    }, []);

    const fetchAllSettings = async () => {
        try {
            const [appearance, account, system] = await Promise.all([
                getAppearanceSettings(),
                getAccountSettings(),
                getSystemSettings()
            ]);

            setAppearanceSettings(appearance);
            setAccountSettings(account);
            setSystemSettings(system);

            // Set account info from auth if no settings exist
            if (!account && auth.currentUser) {
                setAccountSettings({
                    name: auth.currentUser.displayName || '',
                    email: auth.currentUser.email || '',
                    createdAt: null,
                    updatedAt: null
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'فشل في تحميل الإعدادات' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (type: 'appearance' | 'account' | 'system') => {
        setSaving(true);
        setMessage(null);

        try {
            let success = false;

            switch (type) {
                case 'appearance':
                    if (appearanceSettings) {
                        success = await updateAppearanceSettings({
                            primaryColor: appearanceSettings.primaryColor,
                            secondaryColor: appearanceSettings.secondaryColor || '#78716c',
                            buttonColor: appearanceSettings.buttonColor || appearanceSettings.primaryColor,
                            buttonTextColor: appearanceSettings.buttonTextColor || '#ffffff',
                            cardTitleColor: appearanceSettings.cardTitleColor || appearanceSettings.primaryColor,
                            postsPerPage: appearanceSettings.postsPerPage
                        });
                    }
                    break;
                case 'account':
                    if (accountSettings && auth.currentUser) {
                        success = await updateAccountSettings({
                            name: accountSettings.name,
                            email: accountSettings.email
                        });
                    }
                    break;
                case 'system':
                    if (systemSettings) {
                        success = await updateSystemSettings({
                            siteTitle: systemSettings.siteTitle,
                            siteDescription: systemSettings.siteDescription,
                            contactEmail: systemSettings.contactEmail,
                            notificationEmail: systemSettings.notificationEmail
                        });
                    }
                    break;
            }

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

    const handlePasswordChange = async () => {
        if (!auth.currentUser) return;

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email!,
                currentPassword
            );

            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);

            setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error changing password:', errorMessage);
            console.error('Error changing password:', error);
            if (error instanceof Error && 'code' in error && error.code === 'auth/wrong-password') {
                setMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
            } else {
                setMessage({ type: 'error', text: 'فشل في تغيير كلمة المرور' });
            }
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const tabs = [
        { id: 'appearance', label: 'المظهر', icon: Palette },
        { id: 'account', label: 'الحساب', icon: User },
        { id: 'notifications', label: 'البريد الإلكتروني', icon: Mail },
        { id: 'system', label: 'النظام', icon: SettingsIcon }
    ] as const;

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

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900 mb-2">الإعدادات</h1>
                <p className="text-stone-600">تحكم بإعدادات الموقع المختلفة</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-stone-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                                    }
                                `}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
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

            {/* Tab Content */}
            <div>
                {/* Appearance Tab */}
                {activeTab === 'appearance' && appearanceSettings && (
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                        <div className="p-6 border-b border-stone-100">
                            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                <Palette size={20} className="text-primary" />
                                إعدادات المظهر
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        اللون الأساسي
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={appearanceSettings.primaryColor}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                primaryColor: e.target.value
                                            })}
                                            className="h-10 w-20 border border-stone-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={appearanceSettings.primaryColor}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                primaryColor: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Live Preview Section */}
                                <div className="mt-6 md:col-span-2 border-t border-stone-100 pt-6">
                                    <h3 className="text-sm font-medium text-stone-700 mb-4">معاينة الألوان</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {/* Primary Button Preview */}
                                        <button
                                            className="px-6 py-2 rounded-lg text-white font-medium shadow-sm transition-opacity hover:opacity-90"
                                            style={{ backgroundColor: appearanceSettings.buttonColor || appearanceSettings.primaryColor, color: appearanceSettings.buttonTextColor || '#ffffff' }}
                                        >
                                            زر أساسي
                                        </button>

                                        {/* Secondary/Outline Button Preview */}
                                        <button
                                            className="px-6 py-2 rounded-lg bg-transparent border-2 font-medium"
                                            style={{
                                                borderColor: appearanceSettings.primaryColor,
                                                color: appearanceSettings.primaryColor
                                            }}
                                        >
                                            زر ثانوي
                                        </button>

                                        {/* Link Preview */}
                                        <div className="flex items-center px-4 bg-stone-50 rounded-lg">
                                            <span style={{ color: appearanceSettings.primaryColor }} className="underline cursor-pointer">
                                                رابط نصي
                                            </span>
                                        </div>

                                        {/* Icon/Badge Preview */}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                            style={{ backgroundColor: appearanceSettings.primaryColor }}
                                        >
                                            <Palette size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        اللون الثانوي (اختياري)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={appearanceSettings.secondaryColor || '#78716c'}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                secondaryColor: e.target.value
                                            })}
                                            className="h-10 w-20 border border-stone-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={appearanceSettings.secondaryColor || ''}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                secondaryColor: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        لون الأزرار
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={appearanceSettings.buttonColor || appearanceSettings.primaryColor}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                buttonColor: e.target.value
                                            })}
                                            className="h-10 w-20 border border-stone-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={appearanceSettings.buttonColor || ''}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                buttonColor: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder={appearanceSettings.primaryColor}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        لون نص الأزرار
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={appearanceSettings.buttonTextColor || '#ffffff'}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                buttonTextColor: e.target.value
                                            })}
                                            className="h-10 w-20 border border-stone-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={appearanceSettings.buttonTextColor || ''}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                buttonTextColor: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        لون عناوين المقالات في الكاردات
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={appearanceSettings.cardTitleColor || appearanceSettings.primaryColor}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                cardTitleColor: e.target.value
                                            })}
                                            className="h-10 w-20 border border-stone-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={appearanceSettings.cardTitleColor || ''}
                                            onChange={(e) => setAppearanceSettings({
                                                ...appearanceSettings,
                                                cardTitleColor: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder={appearanceSettings.primaryColor}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    عدد المقالات في الصفحة
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={appearanceSettings.postsPerPage}
                                    onChange={(e) => setAppearanceSettings({
                                        ...appearanceSettings,
                                        postsPerPage: parseInt(e.target.value) || 12
                                    })}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleSave('appearance')}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            حفظ المظهر
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Account Tab */}
                {
                    activeTab === 'account' && accountSettings && (
                        <div className="space-y-8">
                            {/* Account Info */}
                            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                <div className="p-6 border-b border-stone-100">
                                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                        <User size={20} className="text-primary" />
                                        معلومات الحساب
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            الاسم
                                        </label>
                                        <input
                                            type="text"
                                            value={accountSettings.name}
                                            onChange={(e) => setAccountSettings({
                                                ...accountSettings,
                                                name: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            البريد الإلكتروني
                                        </label>
                                        <input
                                            type="email"
                                            value={accountSettings.email}
                                            onChange={(e) => setAccountSettings({
                                                ...accountSettings,
                                                email: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleSave('account')}
                                            disabled={saving}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    جاري الحفظ...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    حفظ المعلومات
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Change */}
                            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                <div className="p-6 border-b border-stone-100">
                                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                        <Lock size={20} className="text-primary" />
                                        تغيير كلمة المرور
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            كلمة المرور الحالية
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                            >
                                                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                كلمة المرور الجديدة
                                            </label>
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                تأكيد كلمة المرور الجديدة
                                            </label>
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    جاري التغيير...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    تغيير كلمة المرور
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Email & Notifications Tab */}
                {
                    activeTab === 'notifications' && systemSettings && (
                        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                            <div className="p-6 border-b border-stone-100">
                                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                    <Mail size={20} className="text-primary" />
                                    إعدادات البريد الإلكتروني والإشعارات
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            بريد الاتصال العام
                                        </label>
                                        <input
                                            type="email"
                                            value={systemSettings.contactEmail}
                                            onChange={(e) => setSystemSettings({
                                                ...systemSettings,
                                                contactEmail: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            بريد الإشعارات (اختياري)
                                        </label>
                                        <input
                                            type="email"
                                            value={systemSettings.notificationEmail || ''}
                                            onChange={(e) => setSystemSettings({
                                                ...systemSettings,
                                                notificationEmail: e.target.value
                                            })}
                                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="notifications@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Bell size={20} className="text-primary mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-primary-dark mb-1">ملاحظة</h3>
                                            <p className="text-sm text-primary-dark">
                                                بريد الاتصال العام سيظهر في صفحة التواصل، بينما بريد الإشعارات سيُستخدم لإرسال تنبيهات المستقبلية.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleSave('system')}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
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
                        </div>
                    )
                }

                {/* System Tab */}
                {
                    activeTab === 'system' && systemSettings && (
                        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                            <div className="p-6 border-b border-stone-100">
                                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                    <Globe size={20} className="text-primary" />
                                    إعدادات النظام
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        عنوان الموقع
                                    </label>
                                    <input
                                        type="text"
                                        value={systemSettings.siteTitle}
                                        onChange={(e) => setSystemSettings({
                                            ...systemSettings,
                                            siteTitle: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        وصف الموقع
                                    </label>
                                    <textarea
                                        value={systemSettings.siteDescription}
                                        onChange={(e) => setSystemSettings({
                                            ...systemSettings,
                                            siteDescription: e.target.value
                                        })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Globe size={20} className="text-blue-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-blue-900 mb-1">معلومات SEO</h3>
                                            <p className="text-sm text-blue-700">
                                                عنوان الموقع والوصف سيُستخدمان في محركات البحث والوسوم الوصفية.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleSave('system')}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                حفظ إعدادات النظام
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
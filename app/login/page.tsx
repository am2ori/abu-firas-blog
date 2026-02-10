'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { FirebaseError } from 'firebase/app';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = 'login_attempts';

interface LoginAttempts {
    count: number;
    lockedUntil: number | null;
}

function getAttempts(): LoginAttempts {
    try {
        const data = sessionStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch { /* ignore */ }
    return { count: 0, lockedUntil: null };
}

function saveAttempts(attempts: LoginAttempts) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch { /* ignore */ }
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const router = useRouter();

    // Check lock status on mount and update countdown
    const checkLockStatus = useCallback(() => {
        const attempts = getAttempts();
        if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
            setIsLocked(true);
            setRemainingTime(Math.ceil((attempts.lockedUntil - Date.now()) / 1000));
            return true;
        }
        if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
            // Lock expired — reset
            saveAttempts({ count: 0, lockedUntil: null });
            setIsLocked(false);
            setRemainingTime(0);
        }
        return false;
    }, []);

    useEffect(() => {
        checkLockStatus();
        const interval = setInterval(() => {
            const attempts = getAttempts();
            if (attempts.lockedUntil) {
                const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
                if (remaining <= 0) {
                    saveAttempts({ count: 0, lockedUntil: null });
                    setIsLocked(false);
                    setRemainingTime(0);
                } else {
                    setRemainingTime(remaining);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [checkLockStatus]);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check if locked
        if (checkLockStatus()) return;

        setLoading(true);

        try {
            await login(email, password);
            // Reset attempts on success
            saveAttempts({ count: 0, lockedUntil: null });
            router.push('/admin');
        } catch (err: unknown) {
            const attempts = getAttempts();
            const newCount = attempts.count + 1;

            if (newCount >= MAX_ATTEMPTS) {
                // Lock the account
                const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
                saveAttempts({ count: newCount, lockedUntil });
                setIsLocked(true);
                setRemainingTime(Math.ceil(LOCKOUT_DURATION_MS / 1000));
                setError(`تم تجاوز الحد الأقصى (${MAX_ATTEMPTS} محاولات). يُرجى الانتظار 15 دقيقة.`);
            } else {
                saveAttempts({ count: newCount, lockedUntil: null });
                if (err instanceof FirebaseError) {
                    setError(`فشل تسجيل الدخول: تحقق من البريد الإلكتروني أو كلمة المرور. (${MAX_ATTEMPTS - newCount} محاولات متبقية)`);
                } else {
                    setError('حدث خطأ غير متوقع.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-stone-100 p-8">
                <h1 className="text-2xl font-bold text-stone-900 mb-6 text-center">تسجيل دخول المشرف</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {isLocked ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-stone-800 mb-2">تم قفل تسجيل الدخول مؤقتاً</h2>
                        <p className="text-stone-500 text-sm mb-4">يُرجى المحاولة بعد:</p>
                        <div className="text-3xl font-mono font-bold text-red-600" dir="ltr">
                            {formatTime(remainingTime)}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">البريد الإلكتروني</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-left ltr"
                                placeholder="admin@example.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">كلمة المرور</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-left ltr"
                                dir="ltr"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-900 text-white py-2.5 rounded-lg hover:bg-amber-800 transition-colors font-medium disabled:opacity-70"
                        >
                            {loading ? 'جاري التحقق...' : 'دخول'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

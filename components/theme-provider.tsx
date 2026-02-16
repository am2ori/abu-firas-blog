'use client';

import { useEffect, useState } from 'react';
import { getAppearanceSettings, AppearanceSettings } from '@/lib/settings';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppearanceSettings | null>(null);

    useEffect(() => {
        async function loadTheme() {
            try {
                const appearance = await getAppearanceSettings();
                if (appearance) {
                    setSettings(appearance);
                    applyTheme(appearance);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        }
        loadTheme();
    }, []);

    const applyTheme = (theme: AppearanceSettings) => {
        const root = document.documentElement;
        if (theme.primaryColor) {
            root.style.setProperty('--primary', theme.primaryColor);
            // Calculate a darker shade for hover states if not provided (simple approximation)
            root.style.setProperty('--primary-dark', adjustColorBrightness(theme.primaryColor, -20));
        }
        if (theme.secondaryColor) {
            // Check if secondary color is used in globals.css, if not, we can still set it
            root.style.setProperty('--secondary', theme.secondaryColor);
        }
        if (theme.buttonColor) {
            root.style.setProperty('--button-bg', theme.buttonColor);
        } else if (theme.primaryColor) {
            root.style.setProperty('--button-bg', theme.primaryColor);
        }

        if (theme.buttonTextColor) {
            root.style.setProperty('--button-text', theme.buttonTextColor);
        } else {
            root.style.setProperty('--button-text', '#ffffff');
        }

        if (theme.cardTitleColor) {
            root.style.setProperty('--card-title-color', theme.cardTitleColor);
        } else if (theme.primaryColor) {
            root.style.setProperty('--card-title-color', theme.primaryColor);
        }
    };

    // Helper to darken/lighten hex color
    function adjustColorBrightness(hex: string, percent: number) {
        let num = parseInt(hex.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    return <>{children}</>;
}

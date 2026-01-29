# Wameedh - مدونة وميض الكتابة

منصة تدوين عربية حديثة بُنيت باستخدام Next.js 14 و Firebase، مصممة خصيصاً للكاتب **عبدالعظيم أبو فراس**.

## ✨ المميزات

- ✅ دعم كامل للغة العربية (RTL) مع خط IBM Plex Sans Arabic
- ✅ تصميم نظيف وعصري بألوان دافئة
- ✅ لوحة تحكم كاملة لإدارة المحتوى
- ✅ دعم Markdown لكتابة المقالات
- ✅ رفع الصور مباشرة إلى Firebase Storage
- ✅ تحسين محركات البحث (SEO) لكل مقال
- ✅ نظام إعادة توجيه للحفاظ على روابط WordPress القديمة
- ✅ مستجيب تماماً (Responsive) على جميع الأجهزة

## 🚀 البدء السريع

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد Firebase
اتبع التعليمات التفصيلية في ملف [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### 3. تشغيل المشروع محلياً
```bash
npm run dev
```

افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

## 📁 هيكل المشروع

```
├── app/
│   ├── page.tsx              # الصفحة الرئيسية
│   ├── blog/                 # صفحات التدوين
│   │   ├── page.tsx          # قائمة جميع المقالات
│   │   └── [slug]/page.tsx   # صفحة المقال الفردي
│   ├── login/                # صفحة تسجيل الدخول
│   └── admin/                # لوحة التحكم
│       ├── page.tsx          # قائمة المقالات
│       └── posts/
│           ├── new/          # إضافة مقال جديد
│           └── [id]/edit/    # تعديل مقال
├── components/               # المكونات القابلة لإعادة الاستخدام
├── lib/
│   ├── firebase.ts           # إعدادات Firebase
│   └── auth.ts               # دوال المصادقة
├── types/
│   └── index.ts              # TypeScript Types
├── firestore.rules           # قواعد أمان Firestore
├── firestore.indexes.json    # فهارس قاعدة البيانات
└── middleware.ts             # معالجة إعادة التوجيه
```

## 🛠️ التقنيات المستخدمة

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Firebase** (Auth, Firestore, Storage)
- **React Markdown** (لعرض المحتوى)
- **IBM Plex Sans Arabic** (الخط)

## 📝 الاستخدام

### كتابة مقال جديد
1. سجّل الدخول عبر `/login`
2. اذهب إلى لوحة التحكم `/admin`
3. اضغط "كتابة مقال جديد"
4. املأ العنوان والمحتوى (Markdown)
5. ارفع صورة بارزة (اختياري)
6. حدد التصنيف والوسوم
7. فعّل "نشر المقال" عند الجاهزية
8. احفظ!

### إضافة Redirects من WordPress
افتح ملف `middleware.ts` وأضف الروابط القديمة:

```typescript
const LEGACY_REDIRECTS: Record<string, string> = {
  '/2023/01/old-post-title': 'new-slug-here',
  '/category/travel/another-post': 'another-slug',
};
```

## 🚢 النشر (Deployment)

### باستخدام Vercel
```bash
npm install -g vercel
vercel
```

لا تنس إضافة متغيرات البيئة في لوحة تحكم Vercel!

### باستخدام Firebase Hosting
```bash
npm run build
firebase init hosting
firebase deploy
```

## 🔒 الأمان

- جميع قواعد الأمان موجودة في `firestore.rules`
- المستخدمون العاديون يمكنهم القراءة فقط
- المشرفون (isAdmin) فقط يمكنهم الكتابة
- تأكد من تفعيل Custom Claims للمستخدم Admin

## 📄 الترخيص

هذا المشروع خاص بـ **عبدالعظيم أبو فراس**.

## Deployment Rules (Vercel + Firebase)

**⚠️ Critical deployment configuration - MUST follow these rules:**

- **NEVER** use `output: 'export'` in `next.config.ts` - this is a Vercel deployment, not static export
- **Build script**: Must always be `"build": "next build"` in `package.json` - no `next export` 
- **Environment variables management**:
  - Local development: Use `.env.local` file
  - Production/Preview: Add in Vercel → Project → Settings → Environment Variables
  - Required Firebase env vars (exact names):
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Pre-push workflow**: Always run `npm run build` locally before any `git push`
- **Firebase env vars**: Never rename or delete without updating Vercel environment variables too

## AI Agents Instructions (OpenCode, Antigravity, etc.)

**🤖 Rules for AI agents working on this repo:**

- Read the `Deployment Rules` section above BEFORE modifying any config or deployment code
- **NEVER** enable static export or add `output: 'export'` to `next.config.ts`
- Preserve existing environment variable naming conventions when adding new Firebase vars
- After changing config files or dependencies, ALWAYS run `npm run build` and ensure it passes before committing
- Explain any breaking changes clearly in commit messages
- Don't modify deployment settings without understanding the Vercel + Firebase setup

See [PROJECT_SKILLS.md](./PROJECT_SKILLS.md) for AI/tool-specific guidance.

---

**صُنع بحب في Google Antigravity 🚀**

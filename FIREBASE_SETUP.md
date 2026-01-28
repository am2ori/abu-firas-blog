# إعداد Firebase للمشروع

## الخطوة 1: إنشاء مشروع Firebase

1. توجه إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط على "Add project" أو "إضافة مشروع"
3. أدخل اسم المشروع (مثلاً: "wameedh-blog")
4. اتبع الخطوات حتى يتم إنشاء المشروع

## الخطوة 2: تفعيل الخدمات المطلوبة

### Authentication (المصادقة)
1. من القائمة الجانبية، اختر **Build** > **Authentication**
2. اضغط على "Get started"
3. فعّل طريقة "Email/Password"
4. احفظ التغييرات

### Firestore Database (قاعدة البيانات)
1. من القائمة الجانبية، اختر **Build** > **Firestore Database**
2. اضغط على "Create database"
3. اختر الموقع الجغرافي الأقرب لك
4. ابدأ في **Test mode** مؤقتاً (سنرفع قواعد الأمان لاحقاً)

### Storage (التخزين)
1. من القائمة الجانبية، اختر **Build** > **Storage**
2. اضغط على "Get started"
3. ابدأ في **Test mode** مؤقتاً

## الخطوة 3: الحصول على مفاتيح المشروع

1. من القائمة الجانبية، اذهب إلى **Project settings** (أيقونة الترس)
2. في قسم "Your apps"، اضغط على أيقونة **Web** (`</>`)
3. سجّل التطبيق باسم مثل "Wameedh Web App"
4. ستظهر لك مفاتيح التكوين، انسخها

## الخطوة 4: ملء ملف `.env.local`

1. افتح ملف `.env.local` في مجلد المشروع
2. املأ القيم كالتالي:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
\`\`\`

3. احفظ الملف
4. أعد تشغيل الخادم: `npm run dev`

## الخطوة 5: رفع قواعد الأمان

### Firestore Security Rules
1. في Firebase Console، اذهب إلى **Firestore Database** > **Rules**
2. انسخ محتوى ملف `firestore.rules` من المشروع والصقه هناك
3. اضغط **Publish**

### Firestore Indexes
1. في **Firestore Database** > **Indexes**
2. يمكنك إنشاء الفهارس يدوياً أو الانتظار حتى يطلبها النظام تلقائياً عند الاستخدام

### Storage Rules (اختياري)
إذا أردت تأمين Storage:
\`\`\`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.isAdmin == true;
    }
  }
}
\`\`\`

## الخطوة 6: إنشاء مستخدم Admin

1. اذهب إلى **Authentication** > **Users**
2. اضغط "Add user"
3. أدخل بريد إلكتروني وكلمة مرور (احفظهما جيداً!)

### إضافة Custom Claim للـ isAdmin
لتفعيل صلاحيات الأدمن، استخدم Firebase CLI أو Cloud Functions:

**باستخدام Firebase CLI:**
\`\`\`bash
firebase functions:shell
\`\`\`

ثم:
\`\`\`javascript
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims('USER_UID_HERE', {isAdmin: true});
\`\`\`

**أو عبر Cloud Function:**
أنشئ Cloud Function تقوم بتعيين الـ Custom Claim للمستخدم الأول أو بناءً على شرط معين.

## الخطوة 7: الاختبار

1. شغّل المشروع: `npm run dev`
2. افتح `http://localhost:3000/login`
3. سجّل الدخول بالبريد وكلمة المرور
4. إذا نجح، ستنتقل إلى `/admin`
5. جرّب إنشاء مقال جديد!

---

**ملاحظة مهمة:** 
- لا تشارك ملف `.env.local` مع أي شخص
- أضف `.env.local` إلى ملف `.gitignore` (مضاف بالفعل)
- استخدم Firebase Hosting أو Vercel للنشر مع ربط Environment Variables بشكل آمن

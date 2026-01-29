# Project Skills - AI Agent Guidelines

**Next.js + Firebase Blog (abu-firas-blog) - Vercel Deployment**

## Quick Checklist for AI Agents

### ✅ ALLOWED
- Modify Next.js components and pages
- Update Firebase configuration (preserve env var names)
- Add new features and functionality
- Update dependencies (after testing build)
- Modify Tailwind CSS styles
- Add new environment variables (follow naming convention)

### ❌ NOT ALLOWED
- **NEVER** add `output: 'export'` to `next.config.ts`
- **NEVER** change build script from `"next build"`
- **NEVER** rename existing Firebase environment variables
- **NEVER** commit without running `npm run build` first
- **NEVER** push to production without local build verification

### 🔧 DEPLOYMENT RULES
- Platform: Vercel (dynamic hosting)
- Build command: `npm run build` (always)
- Environment: Use `.env.local` locally, Vercel env vars in production
- Firebase integration: Client-side only (no server functions)

### 📋 ENVIRONMENT VARIABLES
Required Firebase variables (exact names):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### 🔄 WORKFLOW
1. Read existing code structure
2. Make changes
3. Run `npm run build` locally
4. Fix any build errors
5. Commit with descriptive message
6. Push changes

### 🚨 BREAKING CHANGES
- Always explain breaking changes in commit messages
- Test build locally before committing
- Update documentation if needed

### 📁 PROJECT STRUCTURE
- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `lib/` - Firebase and auth utilities
- `types/` - TypeScript definitions
- `middleware.ts` - Route redirects (WordPress legacy)

**Remember: This is a Vercel-hosted Next.js app with Firebase backend - not a static site!**
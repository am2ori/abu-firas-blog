import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostData {
  id: string;
  slug?: string;
  published?: boolean;
  tags?: string[];
  updatedAt?: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
}

interface CategoryData {
  id: string;
  updatedAt?: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
}

interface SitemapPage {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.abufiras.com';
  
  try {
    // Fetch all published posts
    const postsRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsRef);
    const posts = postsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as PostData))
      .filter(post => post.published);

    // Fetch categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const categories = categoriesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as CategoryData));

    // Extract unique tags from posts
    const allTags = new Set<string>();
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    // Build sitemap XML
    const staticPages: SitemapPage[] = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
    ];

    const dynamicPages = [
      // Blog posts
      ...posts.map(post => ({
        url: `/blog/${post.slug || post.id}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: post.updatedAt ? new Date(post.updatedAt.toDate()).toISOString() : new Date().toISOString()
      })),
      // Categories
      ...categories.map(category => ({
        url: `/blog/category/${category.id}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: category.updatedAt ? new Date(category.updatedAt.toDate()).toISOString() : new Date().toISOString()
      })),
      // Tags
      ...Array.from(allTags).map(tag => ({
        url: `/blog/tag/${encodeURIComponent(tag)}`,
        priority: '0.6',
        changefreq: 'monthly'
      }))
    ];

    const allPages = [...staticPages, ...dynamicPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page: SitemapPage) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap with static pages only
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Shorter cache on error
      },
    });
  }
}
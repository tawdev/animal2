import { MetadataRoute } from 'next';
import { api, type Product, type BlogPost } from './lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://animalfoodexpress.ma';

    // Static routes
    const routes = [
        '',
        '/products',
        '/blog',
        '/contact',
        '/wishlist',
        '/cart',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    try {
        // Dynamic product routes
        const productsResponse = await api.getProducts({ limit: 1000 });
        const productRoutes = productsResponse.data.map((product: Product) => ({
            url: `${baseUrl}/products/${product.id}`,
            lastModified: new Date(product.createdAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        // Dynamic blog routes
        const blogResponse = await api.getPosts(1, 100);
        const blogRoutes = blogResponse.data.map((post: BlogPost) => ({
            url: `${baseUrl}/blog/${post.id}`,
            lastModified: new Date(post.updatedAt || new Date()),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        }));

        return [...routes, ...productRoutes, ...blogRoutes];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return routes;
    }
}

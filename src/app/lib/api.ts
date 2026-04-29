const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    imageUrl: string | null;
    parentId: number | null;
    parent?: Category | null;
    children?: Category[];
    createdAt: string;
    products?: any[];
}

export interface Product {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    oldPrice?: number | null;
    stock: number;
    imageUrl: string | null;
    imageUrls: string[];
    category: Category | null;
    categoryId: number | null;
    brand: Brand | null;
    brandId: number | null;
    onSale: boolean;
    ecoFriendly: boolean;
    tags: string[];
    description: string | null;
    createdAt: string;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    ecoFriendly?: boolean;
    sort?: string;
}

export interface Order {
    id: number;
    customerName: string;
    email: string;
    phone: string | null;
    address: string | null;
    invoiceReference: string | null;
    items: any;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string | null;
    excerpt: string | null;
    imageUrl: string | null;
    status: string; // Draft, Published
    author: string;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    publishDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NewsletterSubscriber {
    id: number;
    email: string;
    subscribedAt: string;
}

export interface Tip {
    id: number;
    content: string;
    authorName: string;
    authorRole: string;
    isActive: boolean;
    createdAt: string;
}

export interface TagCount {
    tag: string;
    count: number;
}

export interface Brand {
    id: number;
    name: string;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: string;
    products?: any[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface StoreSettings {
    id: number;
    storeName: string;
    supportEmail: string;
    phoneNumber: string;
    address: string;
    logoUrl: string | null;
    description: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    updatedAt: string;
}

export interface ProductStats {
    total: number;
    lowStock: number;
    outOfStock: number;
    active: number;
}

export interface OrderStats {
    total: number;
    pending: number;
    revenue: number;
    inTransit: number;
    todayCount: number;
}

export interface AnalyticsData {
    kpis: {
        totalRevenue: number;
        revenueTrend: number;
        avgOrderValue: number;
        orderTrend: number;
        conversionRate: number;
        conversionTrend: number;
        pendingOrders: number;
        pendingTrend: number;
        newCustomers: number;
        customerTrend: number;
        totalOrders: number;
        totalOrdersTrend: number;
        totalProducts: number;
    };
    trendData: {
        date: string;
        revenue: string;
        orders: string;
    }[];
    salesByCategory: {
        name: string;
        value: string;
    }[];
    topProducts: {
        id: number;
        name: string;
        category: string;
        sales: number;
        imageUrl: string | null;
    }[];
    inventoryHealth: {
        lowStock: number;
        outOfStock: number;
        healthy: number;
    };
    categoryDistribution: {
        name: string;
        count: string;
    }[];
}

export interface Review {
    id: number;
    productId: number;
    name: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    product?: Product;
}

export interface Faq {
    id: number;
    question: string;
    answer: string;
    likes: number;
    dislikes: number;
    isActive: boolean;
    createdAt: string;
}

import Cookies from 'js-cookie';

// ─── Image URL Helper ─────────────────────────────────────────────────────────

/**
 * Converts a relative /uploads/... path to a full URL using the API base.
 * External URLs (http/https/data:) are returned as-is.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    // Relative path like /uploads/file.jpg → http://localhost:3002/uploads/file.jpg
    return `${API_BASE.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

/** Recursively walk an object and fix any field named imageUrl or logoUrl. */
function fixImageUrls<T>(data: T): T {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) return data.map(fixImageUrls) as unknown as T;
    if (typeof data === 'object') {
        const obj = data as Record<string, any>;
        const result: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            if ((key === 'imageUrl' || key === 'logoUrl') && typeof obj[key] === 'string') {
                result[key] = normalizeImageUrl(obj[key]);
            } else if (typeof obj[key] === 'object') {
                result[key] = fixImageUrls(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result as T;
    }
    return data;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = Cookies.get('auth_token');
    
    const baseUrl = API_BASE.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    const url = `${baseUrl}/${cleanPath}`;
    
    const isFormData = options.body instanceof FormData;
    
    const res = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers: {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error ${res.status}: ${path}`);
    }
    
    // Handle 204 No Content or empty responses
    if (res.status === 204 || res.headers.get('Content-Length') === '0') {
        return {} as T;
    }
    
    const text = await res.text();
    if (!text) return {} as T;
    
    try {
        const json = JSON.parse(text);
        return fixImageUrls(json) as T;
    } catch (e) {
        return {} as any;
    }
}

export const api = {
    // Products
    getProducts: (query: ProductQuery & { active?: boolean } = {}) => {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        if (!query.page) params.append('page', '1');
        if (!query.limit) params.append('limit', '8');

        return apiFetch<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    },
    getProductStats: () => apiFetch<ProductStats>('/products/stats'),
    getTags: () => apiFetch<string[]>('/products/tags'),
    getProductById: (id: string | number) =>
        apiFetch<Product>(`/products/${id}`),
    createProduct: (data: Partial<Product> & { categoryName?: string }) =>
        apiFetch<Product>('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch<{ url: string; filename: string }>('/upload', {
            method: 'POST',
            body: formData,
            // apiFetch handles Authorization header via Cookies
            headers: {}, // Let browser set Content-Type for FormData
        }).then(json => {
            json.url = normalizeImageUrl(json.url) || json.url;
            return json;
        });
    },
    uploadImages: (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return apiFetch<{ url: string; filename: string }[]>('/upload/multiple', {
            method: 'POST',
            body: formData,
            headers: {},
        }).then(json => {
            return json.map(item => ({
                ...item,
                url: normalizeImageUrl(item.url) || item.url
            }));
        });
    },
    updateProduct: (id: number, data: Partial<Product> & { categoryName?: string }) =>
        apiFetch<Product>(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteProduct: (id: number) =>
        apiFetch<void>(`/products/${id}`, {
            method: 'DELETE',
        }),

    // Orders
    getOrders: (page = 1, limit = 10, status?: string, search?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        return apiFetch<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    },
    getOrderStats: () => apiFetch<OrderStats>('/orders/stats'),
    getOrderById: (id: string | number) => apiFetch<Order>(`/orders/${id}`),
    trackOrder: (ref: string) => apiFetch<Order>(`/orders/track/${ref}`),
    createOrder: (data: Partial<Order>) => apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateOrderStatus: (id: number, status: Order['status'], email?: string) => apiFetch<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, email }),
    }),
    resendInvoice: (id: number) => apiFetch<{ success: boolean; message: string }>(`/orders/${id}/resend-invoice`, {
        method: 'POST',
    }),

    // Categories
    getCategories: (activeOnly = false) => {
        const query = activeOnly ? '?active=true' : '';
        return apiFetch<Category[]>(`/categories${query}`);
    },
    getUniqueCategories: () => apiFetch<string[]>('/blog/categories/unique'),
    createCategory: (data: { name: string; description?: string; isActive?: boolean; parentId?: number | null; imageUrl?: string | null }) =>
        apiFetch<Category>('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateCategory: (id: number, data: { name?: string; description?: string; isActive?: boolean; parentId?: number | null; imageUrl?: string | null }) =>
        apiFetch<Category>(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteCategory: (id: number) =>
        apiFetch<void>(`/categories/${id}`, {
            method: 'DELETE',
        }),

    // Blog
    getPosts: (page = 1, limit = 6, search?: string, tag?: string, category?: string, sort?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (tag) params.append('tag', tag);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);

        return apiFetch<PaginatedResponse<BlogPost>>(`/blog?${params.toString()}`);
    },

    getPostBySlug: async (slug: string) => {
        // Mock fallback for demonstration slugs
        const mocks: Record<string, BlogPost> = {
            "allergies-alimentaires-bulldog": {
                id: 999,
                title: "Comment gérer les allergies alimentaires de mon Bulldog ?",
                slug: "allergies-alimentaires-bulldog",
                excerpt: "Découvrez les signes d'allergies et comment adapter le régime de votre Bulldog avec des conseils de pro.",
                author: "Dr. Sarah Alami (Vétérinaire)",
                category: "CONSEIL EXPERT",
                imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=1000",
                content: "<h2>Les signes qui ne trompent pas</h2><p>Les Bulldogs sont particulièrement sensibles aux allergies alimentaires. Si vous remarquez des rougeurs entre les doigts, des otites à répétition ou des démangeaisons excessives, il est temps de revoir son bol.</p><h3>La solution : Le régime d'éviction</h3><p>Consultez votre vétérinaire pour mettre en place un régime hypoallergénique strict pendant 8 semaines...</p>",
                status: 'Published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            "top-5-jouets-chats": {
                id: 998,
                title: "Top 5 des jouets d'occupation pour chats d'appartement",
                slug: "top-5-jouets-chats",
                excerpt: "Stimulez l'instinct de chasseur de votre chat avec notre sélection de jouets validée par des comportementalistes.",
                author: "Yassine Drissi (Expert)",
                category: "BIEN-ÊTRE",
                imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1000",
                content: "<h2>Pourquoi votre chat s'ennuie ?</h2><p>Un chat d'appartement a besoin de stimulation mentale pour éviter le stress et l'obésité. Voici nos 5 recommandations : 1. Le circuit à balles... 2. Le tunnel auto-agrippant...</p>",
                status: 'Published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            "hygiene-dentaire-chien": {
                id: 997,
                title: "Hygiène bucco-dentaire : 3 gestes essentiels pour votre chien",
                slug: "hygiene-dentaire-chien",
                excerpt: "Prévenez le tartre et les maladies parodontales grâce à ces conseils simples mais vitaux.",
                author: "Dr. Mehdi Fassi",
                category: "SANTÉ",
                imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=1000",
                content: "<h2>Le tartre, l'ennemi invisible</h2><p>80% des chiens de plus de 3 ans souffrent de maladies dentaires. Voici comment agir : 1. Le brossage régulier... 2. Les lamelles à mâcher enzymatiques...</p>",
                status: 'Published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        if (mocks[slug]) return mocks[slug];
        return apiFetch<BlogPost>(`/blog/slug/${slug}`);
    },

    createPost: (data: Partial<BlogPost>) =>
        apiFetch<BlogPost>('/blog', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updatePost: (id: number, data: Partial<BlogPost>) =>
        apiFetch<BlogPost>(`/blog/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    deletePost: (id: number) =>
        apiFetch<void>(`/blog/${id}`, {
            method: 'DELETE',
        }),

    // Analytics
    getAnalytics: (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiFetch<AnalyticsData>(`/analytics/dashboard${query}`);
    },

    // Brands
    getBrands: () => apiFetch<Brand[]>('/brands'),
    getActiveBrands: () => apiFetch<Brand[]>('/brands/active'),
    createBrand: (data: { name: string; logoUrl?: string; isActive?: boolean }) =>
        apiFetch<Brand>('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateBrand: (id: number, data: { name?: string; logoUrl?: string; isActive?: boolean }) =>
        apiFetch<Brand>(`/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteBrand: (id: number) =>
        apiFetch<void>(`/brands/${id}`, {
            method: 'DELETE',
        }),

    // Newsletter
    subscribeNewsletter: (email: string) =>
        apiFetch<NewsletterSubscriber>('/newsletter/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
    getNewsletterSubscribers: () => apiFetch<NewsletterSubscriber[]>('/newsletter/subscribers'),
    getNewsletterStats: () => apiFetch<{ count: number }>('/newsletter/stats'),
    deleteSubscriber: (id: number) =>
        apiFetch<void>(`/newsletter/subscribers/${id}`, {
            method: 'DELETE',
        }),

    // Tags
    getPopularTags: () => apiFetch<TagCount[]>('/blog/tags'),

    // Tips
    getActiveTip: () => apiFetch<Tip | null>('/tips/active').catch(() => null),
    getTips: () => apiFetch<Tip[]>('/tips'),
    createTip: (data: Partial<Tip>) =>
        apiFetch<Tip>('/tips', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateTip: (id: number, data: Partial<Tip>) =>
        apiFetch<Tip>(`/tips/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteTip: (id: number) =>
        apiFetch<void>(`/tips/${id}`, {
            method: 'DELETE',
        }),

    // Settings
    getSettings: () => apiFetch<StoreSettings>('/settings'),
    updateSettings: (data: Partial<StoreSettings>) => apiFetch<StoreSettings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    // Reviews
    submitReview: (data: { productId: number; name: string; rating: number; comment: string }) =>
        apiFetch<Review>('/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getProductReviews: (productId: number | string) =>
        apiFetch<Review[]>(`/reviews/product/${productId}`), // Backend naturally filters to 'approved' only
    getAllReviews: (status?: string) => {
        const query = status ? `?status=${status}` : '';
        return apiFetch<Review[]>(`/reviews${query}`); // Admin
    },
    updateReviewStatus: (id: number, status: 'pending' | 'approved' | 'rejected') =>
        apiFetch<Review>(`/reviews/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    deleteReview: (id: number) =>
        apiFetch<void>(`/reviews/${id}`, {
            method: 'DELETE',
        }),

    // FAQs
    getFaqs: () => apiFetch<Faq[]>('/faqs'),
    voteFaq: (id: number, type: 'like' | 'dislike', action: 'increment' | 'decrement') =>
        apiFetch<Faq>(`/faqs/${id}/vote`, {
            method: 'PATCH',
            body: JSON.stringify({ type, action }),
        }),
    createFaq: (data: Partial<Faq>) =>
        apiFetch<Faq>('/faqs', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateFaq: (id: number, data: Partial<Faq>) =>
        apiFetch<Faq>(`/faqs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteFaq: (id: number) =>
        apiFetch<void>(`/faqs/${id}`, {
            method: 'DELETE',
        }),

    // Inquiries (Contact)
    submitInquiry: (data: { name: string; email: string; subject: string; message: string }) =>
        apiFetch<any>('/inquiries', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getInquiries: () => apiFetch<any[]>('/inquiries'),
    updateInquiryStatus: (id: number, status: string) =>
        apiFetch<any>(`/inquiries/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    deleteInquiry: (id: number) =>
        apiFetch<void>(`/inquiries/${id}`, {
            method: 'DELETE',
        }),
};

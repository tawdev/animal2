const API_BASE = process.env.NEXT_PUBLIC_API_URL as string;

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminRole = 'admin' | 'stock_manager' | 'order_manager';

export interface AdminUser {
    id: number;
    email: string;
    fullName: string;
    role: AdminRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

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
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
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

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    initial: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
    
    const base = API_BASE.replace(/\/$/, '');
    const path = url.replace(/^\//, '');
    
    // If the path already starts with 'api/', don't prepend it if the base already ends with /api
    if (path.startsWith('api/') && base.endsWith('/api')) {
        return `${base.replace(/\/api$/, '')}/${path}`;
    }
    
    return `${base}/${path}`;
}

/** Recursively walk an object and fix any field named imageUrl or logoUrl. */
function fixImageUrls<T>(data: T): T {
    if (data === null || data === undefined) return data;
    
    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => fixImageUrls(item)) as unknown as T;
    }
    
    // Handle Objects
    if (typeof data === 'object') {
        const obj = data as Record<string, any>;
        const result: Record<string, any> = {};
        
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            
            // Normalize any key that looks like an image URL
            if (['imageUrl', 'logoUrl', 'image', 'thumbnail', 'img'].includes(key) && typeof value === 'string') {
                result[key] = normalizeImageUrl(value);
            } 
            // Normalize arrays of strings (like imageUrls)
            else if (key === 'imageUrls' && Array.isArray(value)) {
                result[key] = value.map((url: any) => 
                    typeof url === 'string' ? normalizeImageUrl(url) : url
                );
            }
            // Recurse into nested objects or arrays
            else if (value !== null && typeof value === 'object') {
                result[key] = fixImageUrls(value);
            }
            // Keep other values as is
            else {
                result[key] = value;
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

    // Testimonials
    getTestimonials: () => apiFetch<Testimonial[]>('/testimonials'),
    getActiveTestimonials: () => apiFetch<Testimonial[]>('/testimonials/active'),
    createTestimonial: (data: Partial<Testimonial>) =>
        apiFetch<Testimonial>('/testimonials', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateTestimonial: (id: number, data: Partial<Testimonial>) =>
        apiFetch<Testimonial>(`/testimonials/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    deleteTestimonial: (id: number) =>
        apiFetch<void>(`/testimonials/${id}`, {
            method: 'DELETE',
        }),

    // Admin Users Management
    getAdminUsers: () => apiFetch<AdminUser[]>('/admin/users'),
    createAdminUser: (data: { fullName: string; email: string; password: string; role: AdminRole }) =>
        apiFetch<AdminUser>('/admin/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateAdminUser: (id: number, data: Partial<{ fullName: string; role: AdminRole; isActive: boolean; password: string }>) =>
        apiFetch<AdminUser>(`/admin/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    toggleAdminUserActive: (id: number) =>
        apiFetch<AdminUser>(`/admin/users/${id}/toggle-active`, {
            method: 'PATCH',
        }),
    deleteAdminUser: (id: number) =>
        apiFetch<void>(`/admin/users/${id}`, {
            method: 'DELETE',
        }),
};

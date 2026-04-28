import { Metadata } from 'next';
import { api, type Review } from '@/app/lib/api';
import ProductClient from '@/app/products/[id]/ProductClient';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const product = await api.getProductById(id);
        if (!product) return { title: 'Produit non trouvé - Animal Food Express' };

        const description = product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || `Achetez ${product.name} sur Animal Food Express. Qualité premium et livraison rapide partout au Maroc.`;

        return {
            title: `${product.name} - Animal Food Express Maroc`,
            description,
            openGraph: {
                title: product.name,
                description,
                images: product.imageUrl ? [product.imageUrl] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description,
                images: product.imageUrl ? [product.imageUrl] : [],
            },
        };
    } catch (error) {
        return { title: 'Animal Food Express Maroc' };
    }
}

export default async function ProductDetailsPage({ params }: Props) {
    const { id } = await params;
    
    try {
        const [product, reviews, settings] = await Promise.all([
            api.getProductById(id),
            api.getProductReviews(id),
            api.getSettings()
        ]);

        if (!product) {
            notFound();
        }

        const averageRating = reviews.length > 0 
            ? reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / reviews.length 
            : 0;

        const productJsonLd = {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: product.imageUrls || [product.imageUrl],
            description: product.description?.replace(/<[^>]*>?/gm, ''),
            sku: product.sku,
            brand: {
                '@type': 'Brand',
                name: product.brand?.name || 'Animal Food Express',
            },
            offers: {
                '@type': 'Offer',
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://animalfoodexpress.ma'}/products/${product.id}`,
                priceCurrency: 'MAD',
                price: product.price,
                availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
            aggregateRating: reviews.length > 0 ? {
                '@type': 'AggregateRating',
                ratingValue: averageRating,
                reviewCount: reviews.length,
            } : undefined,
        };

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
                />
                <ProductClient 
                    initialProduct={product} 
                    initialReviews={reviews} 
                    settings={settings} 
                />
            </>
        );
    } catch (error) {
        console.error('Error fetching product data:', error);
        notFound();
    }
}

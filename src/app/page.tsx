import { Metadata } from 'next';
import { api } from '@/app/lib/api';
import HomeClient from '@/app/HomeClient';

export const metadata: Metadata = {
  title: 'Animal Food Express – Votre Animalerie Premium au Maroc',
  description: 'Découvrez Animal Food Express, la boutique en ligne n°1 au Maroc pour l\'alimentation et les accessoires premium pour chiens, chats, oiseaux et poissons. Livraison rapide partout au Maroc.',
  openGraph: {
    title: 'Animal Food Express – Votre Animalerie Premium au Maroc',
    description: 'Découvrez Animal Food Express, la boutique en ligne n°1 au Maroc pour l\'alimentation et les accessoires premium pour chiens, chats, oiseaux et poissons.',
    images: ['/hero_animals_v3.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animal Food Express – Votre Animalerie Premium au Maroc',
    description: 'Boutique en ligne spécialisée en alimentation et accessoires pour animaux au Maroc.',
    images: ['/hero_animals_v3.png'],
  },
};

export default async function HomePage() {
  // Fetch all initial data on the server
  try {
    const [categoriesRes, popularProductsRes, newProductsRes, brandsRes, blogsRes, faqsRes, testimonialsRes] = await Promise.all([
      api.getCategories(true),
      api.getProducts({ page: 1, limit: 6, active: true, sort: 'popularity' }),
      api.getProducts({ page: 1, limit: 6, active: true, sort: 'createdAt' }),
      api.getBrands(),
      api.getPosts(1, 3),
      api.getFaqs(),
      api.getActiveTestimonials()
    ]);

    const categories = categoriesRes.filter(c => 
      c.isActive && 
      c.parentId === null && 
      ((c.products && c.products.length > 0) || (c.children && c.children.some(child => child.products && child.products.length > 0)))
    );
    const brands = brandsRes.filter(b => b.isActive);

    return (
      <HomeClient 
        initialCategories={categories}
        initialPopularProducts={popularProductsRes.data}
        initialNewProducts={newProductsRes.data}
        initialBrands={brands}
        initialBlogs={blogsRes.data}
        initialFaqs={faqsRes}
        initialTestimonials={testimonialsRes}
      />
    );
  } catch (error) {
    console.error('Error loading homepage data:', error);
    // Fallback to empty states if API fails
    return (
      <HomeClient 
        initialCategories={[]}
        initialPopularProducts={[]}
        initialNewProducts={[]}
        initialBrands={[]}
        initialBlogs={[]}
        initialFaqs={[]}
        initialTestimonials={[]}
      />
    );
  }
}

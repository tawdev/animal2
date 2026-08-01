'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronRight,
  Plus,
  Truck,
  HandCoins,
  Headset,
  Quote,
  PawPrint,
  Cat,
  Dog,
  Bird,
  Fish,
  ShoppingBag,
  CreditCard,
  MapPin,
  Phone,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Stethoscope,
  Package,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Category, type Product, type Brand, type BlogPost, type Faq, type Testimonial } from '@/app/lib/api';
import { useSettings } from '@/app/context/SettingsContext';
import { FALLBACK_TESTIMONIALS, FALLBACK_BLOG_POSTS } from '@/app/constants';
import ProductCard from '@/app/components/ProductCard';
import BlogCard from '@/app/components/BlogCard';
import Skeleton, { ProductSkeleton } from '@/app/components/Skeleton';

interface HomeClientProps {
  initialCategories: Category[];
  initialPopularProducts: Product[];
  initialNewProducts: Product[];
  initialBrands: Brand[];
  initialBlogs: BlogPost[];
  initialFaqs: Faq[];
  initialTestimonials: Testimonial[];
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  chien: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
  chat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  oiseau: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80",
  poisson: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
  rongeur: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80",
  souris: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80",
  santé: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80",
  hygiène: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80",
  accessoire: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80",
};

const getCategoryDisplayImage = (cat: Category): string => {
  if (cat.imageUrl) return cat.imageUrl;
  const nameLower = cat.name.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_CATEGORY_IMAGES)) {
    if (nameLower.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";
};

export default function HomeClient({
  initialCategories,
  initialPopularProducts,
  initialNewProducts,
  initialBrands,
  initialBlogs,
  initialFaqs,
  initialTestimonials
}: HomeClientProps) {
  const { settings } = useSettings();
  const [categories] = useState<Category[]>(initialCategories);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(initialCategories[0]?.id || null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [activeTab, setActiveTab] = useState('Populaires');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(initialPopularProducts);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Default WhatsApp Number
  const whatsappNumber = (settings?.phoneNumber || '212600000000').replace(/\D/g, '');

  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState('');





  const handleTrack = async () => {
    if (!trackingNumber.trim()) return;
    setIsTracking(true);
    setTrackError('');
    setTrackingResult(null);
    try {
      // The tracking endpoint is /orders/track/:ref
      const res = await api.trackOrder(trackingNumber.trim().replace('#', ''));
      if (res && typeof res.items === 'string') {
        try {
          res.items = JSON.parse(res.items);
        } catch (e) {
          console.error('Failed to parse order items', e);
        }
      }
      setTrackingResult(res);
    } catch (err: any) {
      console.error('Tracking error:', err);
      setTrackError('Commande introuvable. Vérifiez le numéro (ex: AFE-2024-XXXX).');
    } finally {
      setIsTracking(false);
    }
  };


  const [faqs, setFaqs] = useState<(Faq & { userVoted: 'like' | 'dislike' | null })[]>(
    initialFaqs.map(f => ({ ...f, userVoted: null }))
  );

  // Load local vote choices from localStorage on mount
  useEffect(() => {
    const savedVotes = localStorage.getItem('faq_votes_local');
    if (savedVotes) {
      try {
        const parsedVotes = JSON.parse(savedVotes);
        setFaqs(prevFaqs => prevFaqs.map((faq) => ({
          ...faq,
          userVoted: parsedVotes[faq.id] || null,
        })));
      } catch (e) {
        console.error('Failed to parse saved votes', e);
      }
    }
  }, []);

  // Save local vote choices to localStorage whenever they change
  useEffect(() => {
    const votesToSave: Record<number, 'like' | 'dislike' | null> = {};
    faqs.forEach(f => {
      votesToSave[f.id] = f.userVoted;
    });
    localStorage.setItem('faq_votes_local', JSON.stringify(votesToSave));
  }, [faqs]);

  const handleFaqVote = async (index: number, type: 'like' | 'dislike') => {
    const faq = faqs[index];
    const prevVote = faq.userVoted;

    try {
      if (prevVote === type) {
        // Toggle off
        await api.voteFaq(faq.id, type, 'decrement');
        setFaqs(prev => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            userVoted: null,
            likes: type === 'like' ? next[index].likes - 1 : next[index].likes,
            dislikes: type === 'dislike' ? next[index].dislikes - 1 : next[index].dislikes,
          };
          return next;
        });
      } else {
        // If already voted for the other type, remove it first on the backend
        if (prevVote) {
          await api.voteFaq(faq.id, prevVote, 'decrement');
        }

        // Set new vote on the backend
        await api.voteFaq(faq.id, type, 'increment');

        setFaqs(prev => {
          const next = [...prev];
          let newLikes = next[index].likes;
          let newDislikes = next[index].dislikes;

          if (prevVote === 'like') newLikes--;
          if (prevVote === 'dislike') newDislikes--;

          if (type === 'like') newLikes++;
          if (type === 'dislike') newDislikes++;

          next[index] = {
            ...next[index],
            userVoted: type,
            likes: newLikes,
            dislikes: newDislikes,
          };
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [testimonials] = useState<Testimonial[]>(initialTestimonials.length > 0 ? initialTestimonials : FALLBACK_TESTIMONIALS);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    if (featuredProducts.length > 0) {
      const timer = setInterval(() => {
        setHeroSlideIndex((prev) => (prev + 1) % Math.min(featuredProducts.length, 5));
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts]);

  // Combined product fetching logic
  useEffect(() => {
    // Skip if it's the first render and we have initial popular products
    if (activeTab === 'Populaires' && featuredProducts === initialPopularProducts) return;

    setIsLoadingFeatured(true);
    let query: any = { page: 1, limit: 6, active: true };
    if (activeTab === 'Populaires') query.sort = 'popularity';
    if (activeTab === 'Promotions') query.onSale = true;
    if (activeTab === 'Nouveautés') query.sort = 'createdAt';

    api.getProducts(query)
      .then(res => {
        setFeaturedProducts(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch featured products:', err);
      })
      .finally(() => {
        setIsLoadingFeatured(false);
      });
  }, [activeTab]);

  useEffect(() => {
    if (activeCategoryId) {
      setIsLoadingProducts(true);
      api.getProducts({ categoryId: activeCategoryId, limit: 6, active: true })
        .then(res => {
          setCategoryProducts(res.data);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setIsLoadingProducts(false);
        });
    }
  }, [activeCategoryId]);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('chien')) return Dog;
    if (lower.includes('chat')) return Cat;
    if (lower.includes('oiseau')) return Bird;
    if (lower.includes('poisson')) return Fish;
    return PawPrint;
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden bg-[#0A0A0B]">
        {/* Background image — Mobile vs Desktop */}
        <div className="absolute inset-0 z-0 block md:hidden">
          <Image
            src="/heroMobile.png"
            alt="Animal Food Express Hero Mobile"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 z-0 hidden md:block">
          <Image
            src="/heroNew.png"
            alt="Animal Food Express Hero"
            fill
            priority
            className="object-cover"
          />
        </div>
        {/* Overlay sombre léger pour garder le texte lisible */}
        <div className="absolute inset-0 z-[1] bg-black/50" />

        <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 relative z-10 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl xl:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                  NUTRITION <br />
                  <span className="text-transparent" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.8)' }}>& QUALITÉ</span> <br />
                  <span className="text-[#EE8C2B]">PREMIUM</span>
                </motion.h1>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg text-white/80 font-medium max-w-lg">
                Animal Food Express — votre source premium pour l'alimentation et le bonheur de vos compagnons. Livraison partout au Maroc.
              </motion.p>
              <div className="flex flex-wrap gap-5">
                <Link
                  href="/products"


                  className="px-10 py-5 bg-[#EE8C2B] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#d97d20] transition-all transform hover:-translate-y-1"
                >
                  Voir la boutique
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 w-full lg:max-w-[360px] relative mx-auto lg:ml-auto">
              <div className="relative aspect-[3/4] w-full bg-white/10 backdrop-blur-md rounded-[28px] border border-white/20 p-3 overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  {featuredProducts.length > 0 && (
                    <motion.div
                      key={featuredProducts[heroSlideIndex % featuredProducts.length]?.id}
                      initial={{ opacity: 0, scale: 0.92, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="relative w-full h-full"
                    >
                      <Link
                        href={`/products/${featuredProducts[heroSlideIndex % featuredProducts.length]?.id}`}
                        className="block w-full h-full relative rounded-[20px] overflow-hidden group bg-white/5"
                      >
                        <Image
                          src={featuredProducts[heroSlideIndex % featuredProducts.length]?.imageUrl || "/placeholder.png"}
                          alt={featuredProducts[heroSlideIndex % featuredProducts.length]?.name}
                          fill
                          className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-sm font-extrabold text-white uppercase italic tracking-tight line-clamp-1">
                            {featuredProducts[heroSlideIndex % featuredProducts.length]?.name}
                          </h3>
                          <div className="text-base font-black text-[#EE8C2B] italic mt-0.5">
                            {featuredProducts[heroSlideIndex % featuredProducts.length]?.price} MAD
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-24 bg-white overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 mb-16">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Nos Catégories</h2>
            <div className="w-20 h-1 bg-[#EE8C2B] mx-auto rounded-full mt-4" />
          </div>
        </div>

        <div className="relative flex overflow-x-hidden group">
          <motion.div
            className="flex gap-20 whitespace-nowrap py-10"
            animate={{ x: [0, -2000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear"
              }
            }}
          >
            {[...categories, ...categories, ...categories].map((cat, idx) => {
              const catImg = getCategoryDisplayImage(cat);
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={`${cat.id}-${idx}`}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="flex flex-col items-center gap-8 shrink-0 transition-transform hover:scale-105"
                >
                  <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(0,0,0,0.03)] hover:shadow-2xl border-[3px] ${isActive ? 'border-[#EE8C2B]' : 'border-slate-50'} hover:border-[#EE8C2B] aspect-square overflow-hidden group/item relative`}>
                    <Image
                      src={catImg}
                      alt={cat.name}
                      fill
                      unoptimized={catImg.startsWith('http')}
                      className={`object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`}
                    />
                  </div>
                  <h3 className={`text-sm sm:text-xl font-black uppercase tracking-[0.2em] italic transition-colors ${isActive ? 'text-[#EE8C2B]' : 'text-slate-800'}`}>{cat.name}</h3>
                </button>
              );
            })}
          </motion.div>
        </div>

        <div className="mx-auto max-w-[1580px] px-6 lg:px-10 mt-16">

          <div className="text-center mt-16">
            <Link
              href={`/products?categoryId=${activeCategoryId}`}
              className="inline-flex items-center gap-4 bg-[#1A5319] text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-all"
            >
              Voir toute la catégorie <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (REDESIGNED) */}
      <section className="py-32 bg-white">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center mb-24">
            <h2 className="text-[42px] md:text-[54px] font-black text-[#1A5319] leading-tight mb-4">La commande en toute simplicité</h2>
            <p className="text-slate-500 text-lg">Trois étapes simples pour apporter le meilleur de la nutrition directement dans sa gamelle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              {
                step: '1',
                title: 'Séléction Nutrition',
                desc: 'Explorez nos recettes approuvées par des vétérinaires et sélectionnez le plan de repas parfait adapté à l\'âge et à la race de votre animal.',
                icon: ShoppingBag
              },
              {
                step: '2',
                title: 'Préparation Premium',
                desc: 'Nous préparons chaque commande avec des ingrédients 100% naturels et tracables. Aucun remplissage, jamais.',
                icon: PawPrint
              },
              {
                step: '3',
                title: 'Livraison Express',
                desc: 'Profitez d\'une expédition express directement à votre porte. La nutrition de votre animal est livrée fraîche et prête à servir.',
                icon: Truck
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="relative mb-12">
                  {/* Outer Glow/Shadow */}
                  <div className="absolute inset-0 bg-[#1A5319]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Main Circle */}
                  <div className="relative w-36 h-36 rounded-full bg-white shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex items-center justify-center border-[6px] border-slate-50 z-10 transition-all duration-500 group-hover:scale-110 group-hover:border-[#1A5319]/10">
                    <item.icon size={48} className="text-[#1A5319]" strokeWidth={1.2} />
                  </div>

                  {/* Step Badge */}
                  <div className="absolute top-0 -right-2 w-11 h-11 rounded-full bg-[#1A5319] flex items-center justify-center text-white font-black text-base shadow-xl z-20 border-4 border-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight italic">{item.title}</h3>
                <p className="text-slate-600 text-[16px] leading-relaxed max-w-[320px] font-medium opacity-80">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <Link href="/products" className="inline-flex items-center gap-2 text-[#1A5319] font-black uppercase tracking-widest text-sm border-b-2 border-[#1A5319] pb-1 hover:gap-4 transition-all">
              Composer ma première commande <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-[1580px] px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Sélection Premium</h2>
            <div className="flex gap-6">
              {['Populaires', 'Promotions', 'Nouveautés'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}


                  className={`text-[12px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#1A5319] border-b-4 border-[#1A5319] pb-2' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {isLoadingFeatured ? (
              Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative aspect-square rounded-[60px] overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1000" alt="About Animal Food Express" fill className="object-cover" />
              <div className="absolute inset-0 bg-[#1A5319]/20 mix-blend-overlay" />
              <div className="absolute bottom-10 left-10 bg-white/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/20">
                <div className="text-5xl font-black italic tracking-tighter mb-1">10+</div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/60">Années d&apos;Expertise</div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <span className="text-[#EE8C2B] font-black uppercase tracking-[0.3em] text-xs mb-6 block">À Propos de Nous</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-10 leading-[0.9]">Passionnés par vos <span className="text-[#1A5319]">animaux</span> depuis 2014</h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed mb-10">
                Chez Animal Food Express, nous croyons que chaque animal mérite le meilleur. C&apos;est pourquoi nous sélectionnons rigoureusement les marques les plus prestigieuses au monde pour garantir une santé optimale à vos compagnons.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                {[
                  { title: 'Qualité Premium', desc: 'Produits testés et approuvés par des experts.' },
                  { title: 'Stock Permanent', desc: 'Vos produits préférés toujours disponibles.' }
                ].map((item, idx) => (
                  <div key={idx} className="border-l-2 border-[#1A5319] pl-6">
                    <h4 className="text-lg font-black uppercase italic mb-2">{item.title}</h4>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/contact" className="inline-flex items-center gap-4 group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 group-hover:bg-[#EE8C2B] group-hover:text-white transition-all duration-500">
                  <ArrowRight size={24} />
                </div>
                <span className="font-black uppercase tracking-widest text-sm">En savoir plus</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONSEILS D'EXPERTS (SEO SECTION) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#EE8C2B]/10 text-[#EE8C2B] text-xs font-black uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-[#EE8C2B] animate-ping" />
                Validation Vétérinaire
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-[0.9]">Conseils de <span className="text-[#1A5319]">Santé & Bien-être</span></h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-xl">
                Nos experts et vétérinaires partenaires partagent leurs meilleurs conseils pour assurer une vie longue et saine à vos compagnons.
              </p>
            </div>
            <div className="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                <div className="w-12 h-12 bg-[#1A5319] rounded-2xl flex items-center justify-center text-white mb-6">
                  <PawPrint size={24} />
                </div>
                <h4 className="text-lg font-black uppercase italic text-slate-900 mb-2">Nutrition</h4>
                <p className="text-slate-500 text-sm">Choisir le bon régime selon la race et l&apos;âge.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 mt-12">
                <div className="w-12 h-12 bg-[#EE8C2B] rounded-2xl flex items-center justify-center text-white mb-6">
                  <Headset size={24} />
                </div>
                <h4 className="text-lg font-black uppercase italic text-slate-900 mb-2">Comportement</h4>
                <p className="text-slate-500 text-sm">Comprendre les besoins psychologiques de votre animal.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(initialBlogs.length > 0 ? initialBlogs : FALLBACK_BLOG_POSTS).map((post: BlogPost) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-20">Ils nous <span className="text-[#EE8C2B]">font confiance</span></h2>
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {testimonials.length > 0 && (
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-2xl font-medium text-slate-700 italic mb-12">&quot;{testimonials[activeTestimonial].content}&quot;</p>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#1A5319] text-white rounded-full flex items-center justify-center font-black text-xl mb-4">
                      {testimonials[activeTestimonial].initial || testimonials[activeTestimonial].name.substring(0, 2)}
                    </div>
                    <h4 className="text-xl font-black uppercase italic">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{testimonials[activeTestimonial].role}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 md:py-32 bg-white">
        <div className="mx-auto max-w-[800px] px-4 md:px-10">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-[#EE8C2B] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4 block">Aide & Support</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Questions Fréquentes</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`bg-slate-50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-slate-100 transition-all duration-500 cursor-pointer overflow-hidden ${activeFaq === idx ? 'bg-white shadow-xl border-[#1A5319]/10' : 'hover:bg-slate-100/50'}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4 md:gap-6">
                  <h3 className={`text-base md:text-xl font-black leading-tight uppercase italic transition-colors ${activeFaq === idx ? 'text-[#1A5319]' : 'text-slate-900'}`}>{faq.question}</h3>
                  <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${activeFaq === idx ? 'bg-[#1A5319] text-white rotate-180' : 'bg-white text-slate-400 shadow-sm'}`}>
                    <ChevronDown size={18} strokeWidth={3} />
                  </div>
                </div>

                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="text-slate-600 font-medium leading-relaxed mb-8 border-t border-slate-200/60 pt-6">{faq.answer}</p>

                      {/* Feedback Buttons */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-200/60">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est-ce que cela vous a aidé ?</span>
                        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleFaqVote(idx, 'like')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border group/btn ${faq.userVoted === 'like' ? 'bg-[#1A5319] text-white border-[#1A5319]' : 'bg-white text-slate-400 border-slate-100 hover:text-[#1A5319] hover:bg-[#1A5319]/5'}`}
                          >
                            <ThumbsUp size={16} className={`${faq.userVoted === 'like' ? 'scale-110' : 'group-hover/btn:scale-110'} transition-transform`} />
                            <span className="text-xs font-black">{faq.likes}</span>
                          </button>
                          <button
                            onClick={() => handleFaqVote(idx, 'dislike')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border group/btn ${faq.userVoted === 'dislike' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-100 hover:text-red-500 hover:bg-red-50'}`}
                          >
                            <ThumbsDown size={16} className={`${faq.userVoted === 'dislike' ? 'scale-110' : 'group-hover/btn:scale-110'} transition-transform`} />
                            <span className="text-xs font-black">{faq.dislikes}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER TRACKING SECTION */}
      <section className="py-32 bg-slate-50">
        <div className="mx-auto max-w-[1000px] px-6 lg:px-10">
          <div className="bg-white rounded-[60px] p-12 md:p-20 shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Background Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A5319]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="relative z-10 text-center mb-16">
              <span className="text-[#1A5319] font-black uppercase tracking-[0.3em] text-xs mb-4 block">Expédition & Logistique</span>
              <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-6">Suivez votre <span className="text-[#EE8C2B]">commande</span></h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">Entrez votre numéro de commande pour connaître l&apos;état d&apos;avancement de votre livraison en temps réel.</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    placeholder="Ex: #AFE-2024-8892"
                    className="w-full pl-14 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:border-[#1A5319]/20 transition-all"
                  />
                </div>
                <button
                  onClick={handleTrack}
                  disabled={isTracking}
                  className="px-10 py-6 bg-[#1A5319] text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isTracking ? 'Recherche...' : 'Suivre'}
                </button>
              </div>

              {trackError && (
                <p className="text-red-500 font-bold text-center mb-8 bg-red-50 py-3 rounded-2xl border border-red-100 italic">
                  {trackError}
                </p>
              )}

              {/* TIMELINE */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Confirmée', icon: CheckCircle, status: ['pending', 'confirmed', 'processing', 'shipped', 'completed'] },
                  { label: 'Préparation', icon: Package, status: ['processing', 'shipped', 'completed'] },
                  { label: 'En route', icon: Truck, status: ['shipped', 'completed'] },
                  { label: 'Livrée', icon: CheckCircle, status: ['completed'] }
                ].map((step, i) => {
                  const isDone = trackingResult && step.status.includes(trackingResult.status) && trackingResult.status !== 'cancelled';
                  const isCurrent = trackingResult && i > 0 &&
                    step.status[0] === trackingResult.status;

                  return (
                    <div key={i} className="flex flex-col items-center text-center group">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${isDone ? 'bg-[#1A5319] text-white shadow-[0_10px_25px_rgba(26,83,25,0.3)]' : isCurrent ? 'bg-[#EE8C2B] text-white shadow-[0_10px_25px_rgba(238,140,43,0.3)]' : 'bg-slate-100 text-slate-300'}`}>
                        <step.icon size={28} />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isDone || isCurrent ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {trackingResult && (
                <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#1A5319]/10">
                      <div className="h-full bg-[#1A5319] transition-all duration-1000" style={{ width: trackingResult.status === 'completed' ? '100%' : trackingResult.status === 'shipped' ? '75%' : trackingResult.status === 'processing' ? '50%' : '25%' }} />
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">État actuel de la livraison</p>
                    <p className="text-2xl font-black text-[#1A5319] italic uppercase mb-1">
                      {trackingResult.status === 'pending' && '⏳ En attente de confirmation'}
                      {trackingResult.status === 'confirmed' && '✅ Commande Confirmée'}
                      {trackingResult.status === 'processing' && '📦 En cours de préparation'}
                      {trackingResult.status === 'shipped' && '🚚 En cours de livraison'}
                      {trackingResult.status === 'completed' && '🏁 Livraison effectuée'}
                      {trackingResult.status === 'cancelled' && '❌ Commande Annulée'}
                    </p>
                    <p className="text-slate-400 text-[11px] font-bold italic">Réf: {trackingResult.invoiceReference}</p>
                  </div>

                  {/* ORDER DETAILS SUMMARY */}
                  <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 text-left">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-50">
                      <h4 className="font-black italic uppercase text-slate-900">Détails du colis</h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(trackingResult.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      {trackingResult.items && Array.isArray(trackingResult.items) ? (
                        trackingResult.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-4">
                              <div className="relative size-14 bg-white rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
                                <Image
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80'}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-transform group-hover/item:scale-110"
                                />
                                <div className="absolute top-0 left-0 bg-[#1A5319] text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg shadow-sm z-10">
                                  {item.quantity}x
                                </div>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-700 truncate pr-2">{item.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium italic">Prix unitaire: {Number(item.price).toFixed(2)} MAD</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-slate-900">{Number(item.price * item.quantity).toFixed(2)} MAD</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-sm">Détails des articles non disponibles.</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white">
                      <span className="font-black italic uppercase text-xs tracking-widest text-white/50">Total de la commande</span>
                      <span className="text-xl font-black">{Number(trackingResult.totalPrice).toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-6">Préférer les notifications automatiques ?</p>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Je%20souhaite%20recevoir%20les%20mises%20à%20jour%20de%20ma%20commande%20(Réf:%20${trackingNumber})%20sur%20WhatsApp.`}
                  className="flex items-center gap-4 text-[#25D366] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
                >
                  <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                    <MessageCircle size={18} />
                  </div>
                  Activer le suivi WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CONTACT CTA & DETAILS */}
      <section className="py-24 bg-white px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px] mb-20">
          <div className="bg-[#1A5319] rounded-[60px] p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div className="w-full h-full border-[100px] border-white rounded-full translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="max-w-2xl relative z-10">
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-10 leading-[0.85]">On reste en <span className="text-[#EE8C2B]">contact ?</span></h2>
              <p className="text-white/70 text-xl font-medium mb-12 max-w-lg leading-relaxed">Questions sur une marque ? Conseil nutritionnel ? Notre équipe d&apos;experts est disponible pour vous 7j/7.</p>
              <div className="flex flex-wrap gap-6">
                <a href={`https://wa.me/${whatsappNumber}`} className="px-12 py-6 bg-[#25D366] text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-4">
                  <MessageCircle size={24} /> WhatsApp
                </a>
                <Link href="/contact" className="px-12 py-6 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-105 transition-all">
                  Formulaire
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/3 mt-20 lg:mt-0 grid grid-cols-1 gap-10 relative z-10">
              {[
                { icon: MapPin, title: 'Boutique', desc: settings?.address || 'Boulevard Zerktouni, Casablanca' },
                { icon: Phone, title: 'Téléphone', desc: settings?.phoneNumber || '+212 6 00 00 00 00' },
                { icon: Headset, title: 'Support', desc: settings?.supportEmail || 'contact@animalfoodexpress.ma' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-[#EE8C2B] transition-all">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">{item.title}</h4>
                    <p className="text-lg font-bold">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOS VETERINAIRE FLOATING BUTTON */}
      <div className="fixed bottom-8 right-8 z-[100] group">
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          SOS Vétérinaire
        </div>
        <a
          href={`https://wa.me/${whatsappNumber}?text=Bonjour,%20j'ai%20besoin%20d'un%20conseil%20vétérinaire%20urgent%20pour%20mon%20animal.`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="SOS Vétérinaire"
          className="relative w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(239,68,68,0.45)] hover:bg-red-600 hover:scale-110 transition-all duration-300 group-hover:-translate-y-1"
        >
          <Stethoscope size={28} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}

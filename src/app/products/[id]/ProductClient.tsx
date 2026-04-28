'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Review, api } from '@/app/lib/api';
import { useWishlist } from '@/app/context/WishlistContext';
import { useCompare } from '@/app/context/CompareContext';
import { useCart } from '@/app/context/CartContext';
import { generateWhatsAppLink } from '@/app/lib/whatsapp';
import {
    Heart, ShoppingCart, Star, Truck, ShieldCheck, CreditCard,
    HelpCircle, Headphones, ChevronRight, Minus, Plus, Share2,
    Facebook, Linkedin, MessageCircleWarning, Copy as CopyIcon,
    GitCompare, MessageCircle, X, MapPin, User, Phone, CheckCircle2, FileText
} from 'lucide-react';
import { useNotification } from '@/app/context/NotificationContext';
import ProductImageZoom from '@/app/components/ProductImageZoom';
import RelatedProducts from '@/app/components/RelatedProducts';
import { StoreSettings } from '@/app/lib/api';

interface ProductClientProps {
    initialProduct: Product;
    initialReviews: Review[];
    settings: StoreSettings | null;
}

export default function ProductClient({ initialProduct, initialReviews, settings }: ProductClientProps) {
    const { showToast } = useNotification();
    const [product, setProduct] = useState<Product>(initialProduct);
    const [activeImage, setActiveImage] = useState<string | null>(initialProduct.imageUrl);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'specification' | 'avis'>('description');
    const [reviewName, setReviewName] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();
    const { addToCart, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleCheckout = async () => {
        if (!product) return;
        setIsCheckoutLoading(true);

        try {
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const invoiceNumber = `AFE-${datePart}-${randomPart}`;

            const orderPayload = {
                invoiceNumber,
                date: now.toISOString(),
                items: [{
                    name: product.name,
                    quantity,
                    price: Number(product.price),
                    imageUrl: product.imageUrl,
                }],
                totalPrice: Number(product.price) * quantity,
                customerInfo,
            };

            const backendOrderData = {
                customerName: customerInfo.name || 'Client WhatsApp',
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                invoiceReference: invoiceNumber,
                totalPrice: orderPayload.totalPrice,
                items: orderPayload.items
            };

            await api.createOrder(backendOrderData as any);

            try {
                localStorage.setItem('petmarket_last_order', JSON.stringify(orderPayload));
            } catch (e) {
                console.error('Could not save order to localStorage', e);
            }

            const whatsappLink = generateWhatsAppLink({
                items: orderPayload.items,
                totalPrice: orderPayload.totalPrice,
                customerInfo,
            }, settings?.phoneNumber);

            setTimeout(() => {
                window.open(whatsappLink, '_blank');
                setIsCheckoutLoading(false);
                setIsCheckingOut(false);
                setIsConfirmed(true);
                clearCart();
            }, 1000);

        } catch (error: unknown) {
            console.error('Order creation failed:', error);
            const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la commande.';
            showToast(`${errorMsg} Veuillez réessayer.`, 'error');
            setIsCheckoutLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewName || !reviewComment || reviewRating === 0) {
            showToast('Veuillez remplir tous les champs et donner une note.', 'error');
            return;
        }

        try {
            const submitted = await api.submitReview({
                productId: Number(product.id),
                name: reviewName,
                rating: reviewRating,
                comment: reviewComment,
            });

            const newReview: Review = {
                id: submitted?.id ?? Date.now(),
                productId: Number(product.id),
                name: reviewName,
                rating: reviewRating,
                comment: reviewComment,
                status: 'approved',
                createdAt: new Date().toISOString() as any,
            };
            setReviews((prev) => [newReview, ...prev]);

            showToast('Votre avis a été publié avec succès !', 'success');

            setReviewName('');
            setReviewComment('');
            setReviewRating(0);
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast('Une erreur est survenue lors de la soumission de votre avis.', 'error');
        }
    };

    const averageRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
        const rating = Math.floor(r.rating);
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating as keyof typeof ratingCounts]++;
        }
    });

    const inWishlist = isInWishlist(product.id);

    if (isConfirmed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white min-h-[70vh]">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tighter text-center">Commande Envoyée !</h1>
                <p className="text-slate-500 mb-2 max-w-md text-center font-medium">
                    Votre commande a été envoyée sur WhatsApp. Nous vous contacterons très prochainement.
                </p>
                <p className="text-[#1A5319] font-bold text-sm mb-8 text-center">
                    Votre devis a été généré automatiquement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Link
                        href="/devis"
                        className="flex items-center justify-center gap-2 bg-[#1A5319] text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#004d26] transition-colors shadow-lg shadow-[#1A5319]/20 flex-1"
                    >
                        <FileText size={16} />
                        Voir mon Devis
                    </Link>
                    <button
                        onClick={() => { setIsConfirmed(false); setQuantity(1); }}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors flex-1"
                    >
                        Continuer
                    </button>
                </div>
                <Link
                    href="/"
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    const handleShare = (platform: string) => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = product.name;
        const urls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        };
        if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

                {/* ═══════ BREADCRUMB ═══════ */}
                <nav className="flex items-center gap-1.5 text-[13px] text-slate-500 py-4 border-b border-slate-100 mb-8 flex-wrap">
                    <Link href="/" className="hover:text-[#1A5319] transition-colors">Accueil</Link>
                    {product.category && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            <Link
                                href={`/products?categoryId=${product.categoryId}`}
                                className="hover:text-[#1A5319] transition-colors"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-slate-800 font-medium">{product.name}</span>
                </nav>

                {/* ═══════ PRODUCT MAIN SECTION ═══════ */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">

                    {/* ── LEFT: Product Image & Gallery ── */}
                    <div className="w-full lg:w-[450px] flex-shrink-0">
                        <div className="border border-slate-200 rounded-2xl relative bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-square flex items-center justify-center p-6 relative">
                                {activeImage ? (
                                    <ProductImageZoom src={activeImage} alt={product.name} />
                                ) : (
                                    <div className="text-slate-200 flex flex-col items-center gap-4">
                                        <MessageCircleWarning size={64} strokeWidth={1} />
                                        <p className="text-sm font-medium">Aucune image disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Thumbnail strip */}
                        {product.imageUrls && product.imageUrls.length > 1 && (
                            <div className="flex flex-nowrap lg:flex-wrap gap-2.5 mt-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar-hide lg:custom-scrollbar">
                                {product.imageUrls.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] flex-shrink-0 rounded-md border-2 transition-all p-1 bg-white overflow-hidden hover:shadow-md ${
                                            activeImage === img 
                                                ? 'border-[#1A5319] shadow-lg shadow-[#1A5319]/10' 
                                                : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <Image src={img} alt="" width={70} height={70} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* If only one image */}
                        {(!product.imageUrls || product.imageUrls.length <= 1) && product.imageUrl && (
                             <div className="flex gap-2 mt-4">
                                <div className="w-[70px] h-[70px] border-2 border-[#1A5319] rounded-md overflow-hidden p-1 bg-white shadow-lg shadow-[#1A5319]/10">
                                    <Image src={product.imageUrl} alt={product.name} width={70} height={70} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── CENTER: Product Info ── */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] font-bold text-[#1a1a2e] leading-tight mb-3">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3 relative group cursor-pointer w-fit">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-[14px] h-[14px] ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <span className="text-[13px] text-slate-600 hover:text-[#1A5319] hover:underline transition-colors">{reviews.length} Avis</span>

                            {/* Hover Status Dropdown (Tooltip) */}
                            <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-slate-200 shadow-xl rounded-xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto origin-top-left transform scale-95 group-hover:scale-100 z-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={`tooltip-${s}`} className={`w-[18px] h-[18px] ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[16px] font-bold text-slate-900">{averageRating.toFixed(1)} sur 5</span>
                                </div>
                                <p className="text-[13px] text-slate-500 mb-4">{reviews.length} évaluations globales</p>
                                
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = ratingCounts[star as keyof typeof ratingCounts];
                                        const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3 text-[13px] text-slate-600">
                                                <button 
                                                    className="min-w-[55px] text-[#007185] hover:text-[#C7511F] hover:underline text-left font-medium"
                                                    onClick={() => {
                                                        setActiveTab('avis');
                                                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    {star} {star === 1 ? 'étoile' : 'étoiles'}
                                                </button>
                                                <div className="flex-1 h-[14px] bg-sky-50 border border-slate-300 rounded-sm overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-[#FFA41C]" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <div className="min-w-[40px] text-right text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
                                                     onClick={() => {
                                                        setActiveTab('avis');
                                                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    {percentage}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <p className={`text-[14px] font-semibold mb-3 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                        </p>

                        {/* Short Description */}
                        {product.description ? (
                            <div 
                                className="text-[14px] text-slate-600 leading-relaxed mb-4 line-clamp-3 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-1 [&_p]:mb-1"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        ) : (
                            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
                                {product.name}. Livraison partout au Maroc. Aliments et accessoires premium pour animaux.
                            </p>
                        )}

                        {/* Wishlist & Compare */}
                        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                className={`flex items-center gap-2 text-[13px] transition-colors ${inWishlist ? 'text-[#1A5319]' : 'text-slate-600 hover:text-[#1A5319]'}`}
                            >
                                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                                Liste de souhaits
                            </button>
                            <button
                                onClick={() => toggleCompare(product.id)}
                                className={`flex items-center gap-2 text-[13px] transition-colors ${isInCompare(product.id) ? 'text-[#1A5319]' : 'text-slate-600 hover:text-[#1A5319]'}`}
                            >
                                <GitCompare className={`w-4 h-4 ${isInCompare(product.id) ? 'text-[#1A5319]' : ''}`} />
                                Comparer
                            </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline flex-wrap gap-3 mb-5">
                            <span className="text-[24px] sm:text-[28px] font-bold text-[#1A5319]">
                                {Number(product.price).toFixed(2).replace('.', ',')} MAD
                            </span>
                            {product.oldPrice && product.oldPrice > product.price && (
                                <span className="text-[14px] sm:text-[16px] text-slate-400 line-through">
                                    {Number(product.oldPrice).toFixed(2).replace('.', ',')} MAD
                                </span>
                            )}
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[14px] text-slate-700 font-bold uppercase tracking-wider">Quantité</span>
                                <div className="flex items-center border border-slate-200 rounded-[20px] overflow-hidden bg-white shadow-sm">
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-[50px] h-[48px] text-center text-[15px] font-bold border-none outline-none bg-transparent text-slate-900"
                                    />
                                    <div className="flex flex-col border-l border-slate-100">
                                        <button
                                            onClick={() => setQuantity(q => Math.min(q + 1, product.stock || 99))}
                                            className="w-[32px] h-[24px] flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1A5319] border-b border-slate-100 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-[32px] h-[24px] flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1A5319] transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={product.stock === 0}
                                onClick={() => {
                                    addToCart({
                                        productId: Number(product.id),
                                        name: product.name,
                                        price: product.price,
                                        imageUrl: product.imageUrl
                                    }, quantity);
                                }}
                                className="h-[48px] px-8 bg-[#1A5319] text-white text-[13px] font-black uppercase tracking-[0.1em] rounded-[20px] hover:bg-[#004d26] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-[#1A5319]/20 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <ShoppingCart className="w-4.5 h-4.5" />
                                <span className="whitespace-nowrap">Ajouter au panier</span>
                            </button>
                        </div>

                        {/* WhatsApp Ordering Button */}
                        <button
                            onClick={() => {
                                if (!settings?.phoneNumber && !process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
                                    showToast('Numéro WhatsApp non configuré.', 'error');
                                    return;
                                }
                                setIsCheckingOut(true);
                            }}
                            className="w-full h-[52px] bg-[#1a1a2e] text-white rounded-[20px] hover:bg-[#111122] transition-all flex items-center justify-center relative overflow-hidden group mb-10 shadow-xl shadow-slate-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-3 z-10">
                                <MessageCircle size={22} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                                <span className="text-[12px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Commander via WhatsApp</span>
                            </div>
                        </button>

                        {/* Product Meta */}
                        <div className="space-y-2 pt-5 border-t border-slate-100 text-[13px]">
                            {product.sku && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-medium">SKU :</span>
                                    <span className="text-slate-700">{product.sku}</span>
                                </div>
                            )}
                            {product.category && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-medium">Catégories :</span>
                                    <Link
                                        href={`/products?categoryId=${product.categoryId}`}
                                        className="text-[#1A5319] hover:underline"
                                    >
                                        {product.category.name}
                                    </Link>
                                </div>
                            )}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap text-[#1A5319]">
                                    <span className="text-slate-500 font-medium whitespace-nowrap">Tags :</span>
                                    {product.tags.map((tag, i) => (
                                        <div key={tag} className="flex items-center group">
                                            <Link
                                                href={`/products?search=${encodeURIComponent(tag)}`}
                                                className="hover:underline"
                                            >
                                                {tag}
                                            </Link>
                                            {i < product.tags!!.length - 1 && (
                                                <span className="text-slate-400 ml-1 mr-2">,</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Social Share */}
                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-slate-500 font-medium">Partager :</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white transition-colors"
                                    >
                                        <Facebook className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white transition-colors"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Trust Badges Sidebar ── */}
                    <div className="w-full lg:w-[250px] flex-shrink-0">
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                            {[
                                {
                                    icon: <ShieldCheck className="w-5 h-5" />,
                                    title: 'QUALITÉ GARANTIE',
                                    desc: 'Qualité professionnelle',
                                },
                                {
                                    icon: <Truck className="w-5 h-5" />,
                                    title: 'LIVRAISON SOIGNÉE',
                                    desc: 'Partout au Maroc',
                                },
                                {
                                    icon: <CreditCard className="w-5 h-5" />,
                                    title: 'PAIEMENT À LA LIVRAISON',
                                    desc: 'Payez à la réception',
                                },
                                {
                                    icon: <HelpCircle className="w-5 h-5" />,
                                    title: "CONSEILS D'EXPERTS",
                                    desc: 'Experts en soins animaliers',
                                },
                                {
                                    icon: <Headphones className="w-5 h-5" />,
                                    title: 'SERVICE CLIENT',
                                    desc: 'À votre écoute 7j/7',
                                },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50/60 transition-colors">
                                    <div className="text-[#1A5319] flex-shrink-0">
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-[#1a1a2e] leading-tight tracking-wide">{badge.title}</div>
                                        <div className="text-[11px] text-[#1A5319] leading-tight mt-0.5">{badge.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════ TABS SECTION ═══════ */}
                <div className="mb-16">
                    <div className="flex justify-start sm:justify-center border-b border-slate-200 overflow-x-auto overflow-y-hidden custom-scrollbar-hide">
                        {[
                            { key: 'description' as const, label: 'Description' },
                            { key: 'specification' as const, label: 'Spécification' },
                            { key: 'avis' as const, label: `Avis (${reviews.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-6 sm:px-8 py-4 text-[14px] sm:text-[15px] font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key
                                    ? 'text-[#1a1a2e]'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-[#1A5319] rounded-full translate-y-1.5" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="py-10">
                        {activeTab === 'description' && (
                            <div className="max-w-3xl mx-auto">
                                {product.description ? (
                                    <div 
                                        className="text-[15px] text-slate-600 leading-relaxed max-w-none 
                                        [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-4 
                                        [&_p]:mb-4 [&_h1]:mt-8 [&_h1:first-child]:mt-0"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="text-[15px] text-slate-600 leading-relaxed text-center">
                                        {product.name}. Produit de haute qualité pour vos animaux de compagnie. Profitez de l'expertise de Animal Food Express pour le bien-être de vos compagnons. Livraison rapide au Maroc.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'specification' && (
                            <div className="max-w-3xl mx-auto">
                                <table className="w-full text-[14px]">
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { label: 'Référence (SKU)', value: product.sku || 'N/A' },
                                            { label: 'Catégorie', value: product.category?.name || 'N/A' },
                                            { label: 'Marque', value: product.brand?.name || 'N/A' },
                                            { label: 'Stock disponible', value: `${product.stock} unités` },
                                            { label: 'État', value: product.stock > 0 ? 'Disponible' : 'Indisponible' },
                                            { label: 'En promotion', value: product.onSale ? 'Oui' : 'Non' },
                                            { label: 'Éco-responsable', value: product.ecoFriendly ? 'Oui' : 'Non' },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-3 pr-8 text-slate-500 font-medium w-[200px]">{row.label}</td>
                                                <td className="py-3 text-slate-800 font-medium">{row.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'avis' && (
                            <div id="reviews-section" className="max-w-5xl mx-auto">
                                {reviews.length > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center gap-8 bg-gradient-to-br from-[#1A5319]/5 to-amber-50/60 border border-[#1A5319]/10 rounded-2xl p-6 mb-10">
                                        <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                            <span className="text-5xl font-black text-[#1A5319]">{averageRating.toFixed(1)}</span>
                                            <div className="flex gap-0.5">
                                                {[1,2,3,4,5].map((s) => (
                                                    <Star key={s} className={`w-4 h-4 ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[12px] text-slate-500 font-medium">{reviews.length} avis</span>
                                        </div>
                                        <div className="flex-1 w-full space-y-2">
                                            {[5,4,3,2,1].map((star) => {
                                                const count = ratingCounts[star as keyof typeof ratingCounts];
                                                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-3 text-[13px]">
                                                        <span className="w-6 text-right text-slate-500 font-semibold">{star}</span>
                                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="w-8 text-slate-400 text-[12px] font-medium">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row gap-10">
                                    <div className="w-full lg:w-[380px] flex-shrink-0">
                                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 sticky top-4">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-9 h-9 rounded-xl bg-[#1A5319]/10 flex items-center justify-center">
                                                    <Star className="w-4 h-4 text-[#1A5319]" />
                                                </div>
                                                <h3 className="text-[17px] font-bold text-[#1a1a2e]">Donner votre avis</h3>
                                            </div>

                                            <form onSubmit={handleSubmitReview} className="space-y-5">
                                                <div>
                                                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">
                                                        Note <span className="text-[#1A5319]">*</span>
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onMouseEnter={() => setHoverRating(s)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                onClick={() => setReviewRating(s)}
                                                                className="transition-all hover:scale-110 active:scale-95"
                                                            >
                                                                <Star
                                                                    className={`w-7 h-7 transition-colors ${
                                                                        (hoverRating || reviewRating) >= s
                                                                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                                                            : 'text-slate-200 hover:text-amber-200'
                                                                    }`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                                        Nom <span className="text-[#1A5319]">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Votre prénom"
                                                        value={reviewName}
                                                        onChange={(e) => setReviewName(e.target.value)}
                                                        className="w-full h-[44px] border border-slate-200 rounded-xl px-4 text-[14px] outline-none focus:border-[#1A5319] transition-all bg-slate-50 placeholder:text-slate-300"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                                        Commentaire <span className="text-[#1A5319]">*</span>
                                                    </label>
                                                    <textarea
                                                        required
                                                        placeholder="Partagez votre expérience..."
                                                        value={reviewComment}
                                                        onChange={(e) => setReviewComment(e.target.value)}
                                                        rows={4}
                                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1A5319] transition-all resize-none bg-slate-50 placeholder:text-slate-300"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full h-[46px] bg-[#1A5319] text-white text-[13px] font-bold rounded-xl hover:bg-[#004d26] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                                                >
                                                    <Star className="w-4 h-4 fill-current" />
                                                    Publier mon avis
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-8">
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <div key={review.id} className="border-b border-slate-100 pb-8 last:border-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#1A5319] font-bold">
                                                                {review.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[15px] font-bold text-[#1a1a2e]">{review.name}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex">
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                                        {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                                            <CheckCircle2 size={12} />
                                                            Achat vérifié
                                                        </div>
                                                    </div>
                                                    <p className="text-[14px] text-slate-600 leading-relaxed pl-[52px]">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <Star size={40} className="text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-500 font-medium italic">Soyez le premier à donner votre avis sur ce produit !</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <RelatedProducts currentProductId={Number(product.id)} categoryId={product.categoryId} />
            </div>
        </div>
    );
}

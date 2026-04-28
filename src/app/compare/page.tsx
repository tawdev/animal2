'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Product } from '@/app/lib/api';
import { useCompare } from '@/app/context/CompareContext';
import { useCart } from '@/app/context/CartContext';
import {
    GitCompare, X, ShoppingCart, ArrowLeft, Trash2,
    CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Star,
    Plus, HelpCircle, Tag
} from 'lucide-react';

export default function ComparePage() {
    const { compareIds, removeFromCompare, clearCompare, count } = useCompare();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [reviewsData, setReviewsData] = useState<Record<number, { count: number, average: number }>>({});
    const [loading, setLoading] = useState(true);
    const MAX_ITEMS = 4;

    useEffect(() => {
        const fetchCompareProducts = async () => {
            if (compareIds.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const fetchedProducts = await Promise.all(
                    compareIds.map(id => api.getProductById(id).catch(() => null))
                );
                const validProducts = fetchedProducts.filter((p): p is Product => p !== null);
                setProducts(validProducts);

                // Fetch reviews for each product
                const reviewsMap: Record<number, { count: number, average: number }> = {};
                await Promise.all(validProducts.map(async (p) => {
                    try {
                        const reviews = await api.getProductReviews(p.id);
                        if (reviews && reviews.length > 0) {
                            const total = reviews.reduce((acc, r) => acc + r.rating, 0);
                            reviewsMap[p.id] = {
                                count: reviews.length,
                                average: total / reviews.length
                            };
                        } else {
                            reviewsMap[p.id] = { count: 0, average: 5 }; // Default to 5 stars if no reviews yet
                        }
                    } catch (e) {
                        reviewsMap[p.id] = { count: 0, average: 5 };
                    }
                }));
                setReviewsData(reviewsMap);

            } catch (error) {
                console.error('Failed to fetch comparison products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompareProducts();
    }, [compareIds]);

    if (loading) {
        return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white mt-10">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-[#1A5319] rounded-full animate-spin"></div>
                    <GitCompare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1A5319]" size={24} />
                </div>
                <p className="mt-6 text-slate-500 font-bold animate-pulse">Chargement de la comparaison...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-20">
                <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-[32px] border border-slate-100 shadow-xl">
                    <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mb-8 group transition-transform hover:scale-110">
                        <GitCompare size={48} className="text-slate-200 group-hover:text-[#1A5319] transition-colors" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Votre liste de comparaison est vide</h2>
                    <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">
                        Vous n'avez pas encore ajouté de produits à comparer. Parcourez notre catalogue et cliquez sur l'icône de comparaison pour voir les produits côte à côte.
                    </p>
                    <Link
                        href="/products"
                        className="flex items-center gap-2 px-10 py-4 bg-[#1A5319] text-white font-black rounded-2xl shadow-[0_8px_30px_rgb(26,83,25,0.25)] hover:shadow-[0_8px_35px_rgb(26,83,25,0.35)] hover:-translate-y-1 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                        Retourner à la boutique
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare slots (actual products + max ONE placeholder)
    const slots = [...products];
    if (slots.length < MAX_ITEMS) {
        slots.push(null as any);
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400 mb-10">
                    <Link href="/" className="hover:text-[#1A5319] transition-colors">Accueil</Link>
                    <span className="text-slate-300">›</span>
                    <span className="text-slate-900 font-bold">Comparer les produits</span>
                </nav>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-[42px] font-black text-[#1D1636] tracking-tight leading-tight mb-4">
                        Comparer les <span className="text-[#1A5319]">Produits</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-[15px] font-medium leading-relaxed">
                        Comparez les caractéristiques techniques et les prix pour trouver la solution idéale pour vos animaux.
                    </p>
                </div>

                {/* Comparison Main Table */}
                <style dangerouslySetInnerHTML={{ __html: `
                    #compare-table-container {
                        scrollbar-width: auto !important;
                        scrollbar-color: #1A5319 #F8FAFC !important;
                    }
                    #compare-table-container::-webkit-scrollbar {
                        height: 12px !important;
                        display: block !important;
                    }
                    #compare-table-container::-webkit-scrollbar-track {
                        background: #F8FAFC !important;
                        border-radius: 10px !important;
                    }
                    #compare-table-container::-webkit-scrollbar-thumb {
                        background: #1A5319 !important;
                        border-radius: 10px !important;
                        border: 3px solid #F8FAFC !important;
                    }
                    #compare-table-container::-webkit-scrollbar-thumb:hover {
                        background: #EE8C2B !important;
                    }
                `}} />
                <div className="relative overflow-hidden mb-16">
                    <div id="compare-table-container" className="overflow-x-auto pb-8">
                        <table className="w-full border-collapse min-w-[1300px]">
                            <thead>
                                <tr>
                                    {/* Characteristics Label Column - Header Part */}
                                    <th className="sticky left-0 z-30 bg-white min-w-[240px] p-0 border-b border-transparent">
                                        <div className="h-full flex flex-col justify-end pb-8">
                                            <h3 className="text-lg font-black text-[#1D1636]">Caractéristiques</h3>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Basé sur vos sélections</p>
                                        </div>
                                    </th>

                                    {/* Product Cards Row */}
                                    {slots.map((product, idx) => (
                                        <th key={product ? product.id : `empty-${idx}`} className="p-4 pt-0 w-1/4 min-w-[280px] align-top">
                                            {product ? (
                                                <div className="relative group h-full flex flex-col bg-white p-6 rounded-[32px] border border-slate-100/50 hover:border-[#1A5319]/20 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500">
                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeFromCompare(product.id)}
                                                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 z-20 border border-slate-100 shadow-sm"
                                                    >
                                                        <X size={16} strokeWidth={2.5} />
                                                    </button>

                                                    {/* Image Box */}
                                                    <div className="relative aspect-[4/3] w-full mb-6 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-500">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                                                <GitCompare size={40} strokeWidth={1} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Image indisponible</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                                    </div>

                                                    {/* Content Container */}
                                                    <div className="flex flex-col flex-1 text-center">
                                                        <div className="mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#EE8C2B]">{product.brand?.name || 'PetMarket'}</span>
                                                        </div>
                                                        <h4 className="text-base font-black text-[#1D1636] leading-tight mb-4 line-clamp-2 min-h-[48px] px-2">
                                                            {product.name}
                                                        </h4>

                                                        <div className="mt-auto space-y-4">
                                                            <div className="text-xl font-black text-[#1A5319] italic tracking-tighter">
                                                                {Number(product.price).toFixed(2).replace('.', ',')} MAD
                                                            </div>

                                                            <button 
                                                                onClick={() => addToCart({
                                                                    productId: Number(product.id),
                                                                    name: product.name,
                                                                    price: product.price,
                                                                    imageUrl: product.imageUrl
                                                                })}
                                                                className="w-full py-4 px-6 bg-[#1A5319] text-white font-black text-[13px] uppercase tracking-widest rounded-2xl hover:bg-[#EE8C2B] transition-all shadow-xl shadow-[#1A5319]/10 active:scale-95 flex items-center justify-center gap-3 group/btn"
                                                            >
                                                                <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                                Ajouter
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center p-10 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 transition-all group">
                                                    <Link href="/products" className="flex flex-col items-center gap-6">
                                                        <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#EE8C2B] group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                                            <Plus size={32} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Comparer</div>
                                                            <div className="text-[11px] font-bold text-slate-300 italic">Ajouter un produit</div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="mt-8">
                                {/* Category Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Catégorie</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.category?.name || 'Alimentation') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Brand Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Marque</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.brand?.name || 'PetMarket') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Volume Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Format / Poids</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.sku?.includes('KG') ? product.sku.split('-').pop() : 'Standard') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Base Material Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Ingrédients</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4 text-[14px] font-medium text-slate-500">
                                            {product ? (product.description?.slice(0, 30) + '...' || 'Premium & Naturel') : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Stock Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Disponibilité</td>
                                    {slots.map((product, idx) => (
                                        <td key={idx} className="py-6 px-4">
                                            {product ? (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${product.stock > 0 ? 'bg-[#E6F9F0] text-[#00D16E]' : 'bg-red-50 text-red-500'}`}>
                                                    {product.stock > 0 ? 'En stock' : 'Rupture'}
                                                </span>
                                            ) : '—'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Rating Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Avis Clients</td>
                                    {slots.map((product, idx) => {
                                        const reviewInfo = product ? reviewsData[product.id] : null;
                                        return (
                                            <td key={idx} className="py-6 px-4">
                                                {product && reviewInfo ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-amber-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star 
                                                                    key={i} 
                                                                    size={14} 
                                                                    className={i < Math.round(reviewInfo.average) ? 'fill-current' : 'text-slate-200'} 
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[12px] font-bold text-slate-400">({reviewInfo.count})</span>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Labels Row */}
                                <tr className="border-t border-slate-50">
                                    <td className="sticky left-0 z-20 bg-white py-6 pr-8 text-[14px] font-bold text-[#1D1636]">Bénéfices</td>
                                    {slots.map((product, idx) => {
                                        const tags = product?.tags;
                                        const displayTags = Array.isArray(tags) 
                                            ? (tags.length > 0 ? tags.join(', ') : 'Santé & Vitalité')
                                            : (tags && tags !== '[]' ? tags : 'Santé & Vitalité');
                                        
                                        return (
                                            <td key={idx} className="py-6 px-4 text-[13px] font-medium text-slate-500">
                                                {product ? displayTags : '—'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-20">
                    {/* Help Card */}
                    <div className="bg-[#F0FDF4] rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
                        <div className="relative z-10 max-w-[70%]">
                            <h3 className="text-2xl font-black text-[#1D1636] mb-3">Besoin d'aide ?</h3>
                            <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                                Consultez notre guide d'achat pour les meilleurs produits pour vos compagnons.
                            </p>
                            <Link href="/blog" className="inline-flex items-center gap-2 text-[#1A5319] font-black group-hover:gap-3 transition-all">
                                Lire le guide
                                <ArrowLeft className="rotate-180" size={18} />
                            </Link>
                        </div>
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-24 h-24 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-slate-200">
                            <span className="text-[60px] font-black opacity-10">?</span>
                        </div>
                    </div>

                    {/* Special Offer Card */}
                    <div className="bg-[#1D1636] rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white mb-3">Offre Spéciale</h3>
                            <p className="text-white/60 font-medium mb-8 leading-relaxed max-w-[80%]">
                                -20% sur votre première commande avec le code <span className="text-[#EE8C2B] font-black">PET20</span>
                            </p>
                            <button className="bg-white text-[#1D1636] px-8 py-3 rounded-xl font-bold hover:bg-[#1A5319] hover:text-white transition-all active:scale-95 shadow-lg">
                                En profiter
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 rotate-12 translate-x-1/4 translate-y-1/4">
                            <Tag size={160} className="text-white fill-current" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

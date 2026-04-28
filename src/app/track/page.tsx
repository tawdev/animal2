'use client';

import React, { useState, Suspense } from 'react';
import { Search, Package, Truck, ShoppingBag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import Link from 'next/link';

function TrackOrderContent() {
    const [reference, setReference] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reference.trim()) return;

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const data = await api.trackOrder(reference.trim());
            setOrder(data);
        } catch (err: any) {
            console.error("Tracking error:", err);
            setError("Aucune commande trouvée avec cette référence. Veuillez vérifier et réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
                        Suivi de <span className="text-[#1A5319]">Commande</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto">
                        Entrez votre numéro de commande ou votre référence de devis pour voir l&apos;état d&apos;avancement de votre livraison.
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100 mb-10">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Ex: DEV-20260428-ABCD or #1234"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 text-slate-900 font-bold outline-none focus:border-[#1A5319] transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-16 px-10 bg-[#1A5319] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#004d26] transition-all shadow-lg shadow-[#1A5319]/20 flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>Suivre <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {order && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                            {/* Order Header */}
                            <div className="bg-[#1A5319] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Référence Commande</p>
                                    <h2 className="text-2xl font-black uppercase italic">{order.invoiceReference || `#${order.id}`}</h2>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Date de commande</p>
                                    <p className="font-bold">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                {/* Dynamic Status Steps */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative">
                                    {/* Line connector for desktop */}
                                    <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-0" />
                                    
                                    {/* Step 1: Reçue */}
                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 shadow-sm ${
                                            ['pending', 'confirmed', 'processing', 'completed'].includes(order.status)
                                            ? 'bg-emerald-100 text-emerald-600' 
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h3 className={`font-black uppercase italic text-sm mb-1 ${['pending', 'confirmed', 'processing', 'completed'].includes(order.status) ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {order.status === 'pending' ? 'En attente' : 'Confirmée'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape 1</p>
                                    </div>

                                    {/* Step 2: Préparation */}
                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 shadow-sm ${
                                            ['confirmed', 'processing', 'completed'].includes(order.status)
                                            ? 'bg-amber-100 text-amber-600' 
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <Package size={24} className={order.status === 'confirmed' || order.status === 'processing' ? 'animate-bounce' : ''} />
                                        </div>
                                        <h3 className={`font-black uppercase italic text-sm mb-1 ${['confirmed', 'processing', 'completed'].includes(order.status) ? 'text-slate-900' : 'text-slate-400'}`}>
                                            Préparation
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape 2</p>
                                    </div>

                                    {/* Step 3: Livraison */}
                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 shadow-sm ${
                                            order.status === 'completed'
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <Truck size={24} />
                                        </div>
                                        <h3 className={`font-black uppercase italic text-sm mb-1 ${order.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>
                                            Expédiée
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape 3</p>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-slate-50 rounded-[24px] p-6 md:p-8 border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Détails de livraison</h4>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            Statut: {order.status}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Destinataire</p>
                                                <p className="font-bold text-slate-900">{order.customerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Adresse</p>
                                                <p className="text-sm font-medium text-slate-600 leading-relaxed">{order.address}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Articles</p>
                                                <p className="font-bold text-slate-900">{order.items?.length || 0} produit(s)</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total TTC</p>
                                                <p className="text-2xl font-black text-[#1A5319]">{Number(order.totalPrice).toFixed(2)} MAD</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/products" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all text-center">
                                        Continuer mes achats
                                    </Link>
                                    <Link href={`/devis?orderId=${order.id}`} className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all text-center">
                                        Voir le devis détaillé
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="text-[#1A5319] animate-spin" />
            </div>
        }>
            <TrackOrderContent />
        </Suspense>
    );
}

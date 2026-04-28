'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, FileText, Loader2 } from 'lucide-react';
import { api, type Order } from '../lib/api';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (orderId) {
                try {
                    const data = await api.getOrderById(orderId);
                    setOrder(data);
                } catch (error) {
                    console.error("Error fetching order:", error);
                }
            }
            setLoading(false);
        }
        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={40} className="text-[#1A5319] animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-slate-50 py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-[#1A5319] to-[#2E7D32] p-12 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6">
                            <CheckCircle2 size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-4 uppercase italic tracking-tight">Commande Confirmée !</h1>
                        <p className="text-white/80 text-lg font-medium">
                            Merci pour votre confiance. Votre compagnon va être ravi !
                        </p>
                        {orderId && (
                            <div className="mt-6 inline-block px-4 py-2 bg-black/10 rounded-full text-sm font-bold tracking-widest">
                                N° COMMANDE : #{orderId}
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Status Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {/* Step 1: Confirmée */}
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                                    ['pending', 'confirmed', 'processing', 'completed'].includes(order?.status ?? '')
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <ShoppingBag size={24} />
                                </div>
                                <h3 className={`font-bold mb-1 ${['pending', 'confirmed', 'processing', 'completed'].includes(order?.status ?? '') ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {order?.status === 'pending' ? 'En attente' : 'Confirmée'}
                                </h3>
                                <p className="text-xs text-slate-500">Paiement à la réception</p>
                            </div>

                            {/* Step 2: Préparation */}
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                                    ['confirmed', 'processing', 'completed'].includes(order?.status ?? '')
                                    ? 'bg-amber-100 text-amber-600' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Package size={24} className={order?.status === 'confirmed' || order?.status === 'processing' ? 'animate-bounce' : ''} />
                                </div>
                                <h3 className={`font-bold mb-1 ${['confirmed', 'processing', 'completed'].includes(order?.status ?? '') ? 'text-slate-900' : 'text-slate-400'}`}>
                                    Préparation
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {order?.status === 'processing' ? 'En cours de traitement' : 
                                     order?.status === 'completed' ? 'Prête' : 'À venir'}
                                </p>
                            </div>

                            {/* Step 3: Livraison */}
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                                    order?.status === 'completed'
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Truck size={24} />
                                </div>
                                <h3 className={`font-bold mb-1 ${order?.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>
                                    Livraison
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {order?.status === 'completed' ? 'Livrée' : 'Sous 24h - 48h'}
                                </p>
                            </div>
                        </div>

                        {/* Order Summary Preview */}
                        {order && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Résumé de la commande</h3>
                                <div className="space-y-3">
                                    {order.items?.map((item: { name: string; quantity: number; price: number }, i: number) => (
                                        <div key={i} className="flex justify-between text-sm font-medium">
                                            <span className="text-slate-600">{item.quantity}x {item.name}</span>
                                            <span className="text-slate-900">{(item.price * item.quantity).toFixed(2)} MAD</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center">
                                        <span className="font-black text-slate-900 uppercase">Total</span>
                                        <span className="text-xl font-black text-[#1A5319]">{Number(order.totalPrice).toFixed(2)} MAD</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/products"
                                className="flex items-center justify-center gap-2 bg-[#1A5319] text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#004d26] transition-all shadow-lg shadow-[#1A5319]/20"
                            >
                                Continuer mes achats
                                <ArrowRight size={16} />
                            </Link>
                            <Link 
                                href={orderId ? `/devis?orderId=${orderId}` : "/devis"}
                                className="flex items-center justify-center gap-2 bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                            >
                                <FileText size={16} />
                                Voir le devis
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 p-6 text-center">
                        <p className="text-slate-400 text-xs font-medium">
                            Besoin d'aide ? Contactez notre service client PetMarket au <span className="text-white">+212 5 22 00 00 00</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={40} className="text-[#1A5319] animate-spin" />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}

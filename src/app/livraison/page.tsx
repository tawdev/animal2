'use client';

import { Truck, Clock, MapPin, ShieldCheck, Box, CheckCircle2, Heart, Zap, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '../context/SettingsContext';

export default function LivraisonPage() {
    const { settings, loading: settingsLoading } = useSettings();

    const whatsappNumber = (settings?.phoneNumber || "+212 600 000 000").replace(/\D/g, '');

    return (
        <div className="flex-1 bg-white">
            {/* Hero Section */}
            <div className="relative py-32 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2048&auto=format&fit=crop')] bg-cover bg-center opacity-50 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="relative max-w-7xl mx-auto px-4 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A5319]/30 border border-[#1A5319]/40 rounded-full text-[#2ecc71] mb-8 backdrop-blur-md">
                        <Truck size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">{settings?.storeName || 'Animal Food Express'}</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">
                        Livraison <br />
                        <span className="text-[#1A5319]">Multi-Espèces</span>
                    </h1>
                    <p className="text-xl text-slate-200 font-medium max-w-2xl leading-relaxed italic border-l-4 border-[#1A5319] pl-6">
                        Que vous ayez un chien, un chat, un rongeur ou des poissons, nous livrons le bonheur à toutes les échelles, partout au Maroc.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-24">
                {/* Key Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="w-16 h-16 bg-[#1A5319] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1A5319]/20 mb-8 group-hover:rotate-6 transition-transform">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase italic">Vitesse Éclair</h3>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Commandez avant midi, expédition le jour même. Livraison en 24h sur l'axe Casa-Rabat.
                        </p>
                    </div>
                    <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="w-16 h-16 bg-[#1A5319] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1A5319]/20 mb-8 group-hover:rotate-6 transition-transform">
                            <Heart size={32} fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase italic">Soin Animalier</h3>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Manipulation délicate pour éviter toute altération des sacs de croquettes ou produits fragiles.
                        </p>
                    </div>
                    <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="w-16 h-16 bg-[#1A5319] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1A5319]/20 mb-8 group-hover:rotate-6 transition-transform">
                            <MapPin size={32} fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase italic">Suivi Temps Réel</h3>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Tracez votre colis de notre entrepôt jusqu'au panier de votre fidèle compagnon.
                        </p>
                    </div>
                </div>

                {/* Detailed Process */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-[#1A5319]/10 rounded-[52px] blur-3xl group-hover:bg-[#1A5319]/20 transition-all"></div>
                        <div className="relative grid grid-cols-2 gap-4">
                            <img 
                                src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop" 
                                alt="Chiens et Chats" 
                                className="rounded-[32px] shadow-xl border border-white/20 object-cover aspect-square hover:scale-[1.02] transition-transform"
                            />
                            <img 
                                src="https://images.unsplash.com/photo-1509205477838-a534e43a849f?q=80&w=800&auto=format&fit=crop" 
                                alt="Hamsters et Rongeurs" 
                                className="rounded-[32px] shadow-xl border border-white/20 object-cover aspect-square mt-8 hover:scale-[1.02] transition-transform"
                            />
                            <img 
                                src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop" 
                                alt="Poissons et Aquariophilie" 
                                className="rounded-[32px] shadow-xl border border-white/20 object-cover aspect-square -mt-8 hover:scale-[1.02] transition-transform"
                            />
                            <img 
                                src="https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=800&auto=format&fit=crop" 
                                alt="Oiseaux" 
                                className="rounded-[32px] shadow-xl border border-white/20 object-cover aspect-square hover:scale-[1.02] transition-transform"
                            />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 uppercase tracking-tighter italic leading-none">
                            Comment nous <span className="text-[#1A5319]">Livrons le Bonheur</span>
                        </h2>
                        <div className="space-y-10">
                            {[
                                { title: 'Audit de Fraîcheur', desc: 'Chaque sac de croquettes est inspecté pour garantir une date de péremption optimale et un emballage intact.' },
                                { title: 'Protection Renforcée', desc: 'Utilisation de cartons double cannelure pour les commandes multi-articles et les accessoires délicats.' },
                                { title: 'Réseau Spécialisé', desc: 'Partenaires logistiques formés à la livraison de produits volumineux (sacs de 15kg+) et fragiles.' },
                                { title: 'Confirmation WhatsApp', desc: 'Notre équipe vous contacte par WhatsApp pour confirmer le créneau horaire de livraison.' },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 text-[#1A5319] flex items-center justify-center font-black text-xl border border-slate-100 group-hover:bg-[#1A5319] group-hover:text-white transition-all">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">{step.title}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed italic">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing Table */}
                <div className="bg-slate-900 rounded-[60px] p-8 md:p-20 text-white relative overflow-hidden mb-32">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A5319] opacity-20 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A5319] opacity-10 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
                    
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <h3 className="text-4xl font-black mb-8 uppercase tracking-tighter italic">Grille des <span className="text-[#1A5319]">Tarifs</span></h3>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed italic">
                                Notre showroom étant situé à Marrakech, nous offrons des tarifs préférentiels pour la ville ocre et ses environs.
                            </p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-[#1A5319]/30 hover:bg-[#1A5319]/10 transition-colors group">
                                    <span className="text-white font-bold uppercase tracking-wider text-sm">Marrakech & Région (Local)</span>
                                    <span className="text-2xl font-black text-[#2ecc71]">20 MAD</span>
                                </div>
                                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <span className="text-slate-300 font-bold uppercase tracking-wider text-sm">Casablanca & Grand Casa</span>
                                    <span className="text-2xl font-black text-white">35 MAD</span>
                                </div>
                                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <span className="text-slate-300 font-bold uppercase tracking-wider text-sm">Grandes Villes (Rabat, Tanger...)</span>
                                    <span className="text-2xl font-black text-white">45 MAD</span>
                                </div>
                                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <span className="text-slate-300 font-bold uppercase tracking-wider text-sm">Autres Zones & Sud</span>
                                    <span className="text-2xl font-black text-white">65 MAD</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1A5319] rounded-[40px] p-10 flex flex-col justify-center items-center text-center">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8">
                                <CheckCircle2 size={48} className="text-white" />
                            </div>
                            <h4 className="text-3xl font-black mb-4 uppercase italic">Livraison Gratuite</h4>
                            <p className="text-white/80 font-medium mb-8 leading-relaxed italic">
                                Pour toute commande supérieure à 
                                <span className="block text-4xl font-black text-white mt-2">600 MAD</span>
                            </p>
                            <Link href="/products" className="w-full h-14 bg-white text-[#1A5319] rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-xl">
                                Faire mes achats
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Specialized Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    <div className="bg-[#f1f8f3] p-12 rounded-[48px] border border-[#1A5319]/10">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Gros Volumes</h3>
                        <p className="text-slate-600 font-medium leading-relaxed italic">
                            Besoin de plusieurs sacs de 15kg ? Notre service logistique est équipé pour manipuler les charges lourdes sans surcoût, directement à votre étage.
                        </p>
                    </div>
                    <div className="bg-[#f1f8f3] p-12 rounded-[48px] border border-[#1A5319]/10">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Produits Frais</h3>
                        <p className="text-slate-600 font-medium leading-relaxed italic">
                            Certains compléments alimentaires nécessitent une température contrôlée. Nous utilisons des isolants thermiques spécifiques pour ces produits.
                        </p>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-slate-900 rounded-[60px] py-24 px-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589924691106-073b19f56586?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter relative z-10">
                        Une Urgence <span className="text-[#1A5319]">Croquettes ?</span>
                    </h2>
                    <p className="text-slate-400 font-medium mb-12 max-w-2xl mx-auto italic leading-relaxed text-lg relative z-10">
                        Si votre stock est épuisé, contactez notre ligne d'assistance prioritaire pour une livraison express dans la journée sur Casablanca et Marrakech.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link 
                            href={`https://wa.me/${whatsappNumber}`} 
                            className="inline-flex h-16 items-center px-10 bg-[#25D366] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#25D366]/20"
                        >
                            Assistance WhatsApp
                        </Link>
                        <Link 
                            href="/contact" 
                            className="inline-flex h-16 items-center px-10 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-100 transition-all"
                        >
                            Nous Contacter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

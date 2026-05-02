'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import { api, Category } from '../lib/api';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
    const { settings, loading: settingsLoading } = useSettings();
    const [categories, setCategories] = useState<Category[]>([]);
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');

    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = () => {
        if (email && email.includes('@')) {
            setIsSubscribed(true);
            setEmail('');
            setTimeout(() => setIsSubscribed(false), 5000);
        }
    };

    useEffect(() => {
        setMounted(true);
        api.getCategories(true).then(res => {
            const prioritizedNames = ['Chiens', 'Chats', 'Oiseaux', 'Rongeurs', 'Poissons', 'Accessoires'];
            const filtered = res.filter(c =>
                c.parentId === null &&
                prioritizedNames.some(name => c.name.toLowerCase().includes(name.toLowerCase()))
            ).sort((a, b) => {
                const indexA = prioritizedNames.findIndex(name => a.name.toLowerCase().includes(name.toLowerCase()));
                const indexB = prioritizedNames.findIndex(name => b.name.toLowerCase().includes(name.toLowerCase()));
                return indexA - indexB;
            });
            setCategories(filtered.length > 0 ? filtered.slice(0, 6) : res.slice(0, 6));
        }).catch(err => console.error('Footer categories fetch error:', err));
    }, []);

    return (
        <footer className="bg-white pt-0 print:hidden">
            {/* Newsletter Section */}
            <div className="bg-[#1A5319] py-12">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                            <Send size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">Restez informé</h3>
                            <p className="text-white/70 font-medium">Recevez nos offres et conseils exclusifs</p>
                        </div>
                    </div>
                    <div className="flex w-full max-w-xl bg-white rounded-xl p-1.5 overflow-hidden">
                        <input 
                            type="email" 
                            placeholder={isSubscribed ? "Inscription réussie !" : "Votre email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubscribed}
                            className="flex-1 px-6 py-3 text-slate-900 font-medium outline-none border-none disabled:bg-white"
                        />
                        <button 
                            onClick={handleSubscribe}
                            className={`${isSubscribed ? 'bg-green-500' : 'bg-[#EE8C2B]'} text-white px-8 py-3 rounded-lg font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center min-w-[140px]`}
                        >
                            {isSubscribed ? 'Merci !' : "S'inscrire"}
                        </button>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">Suivez-nous</span>
                        <div className="flex items-center gap-4">
                            <Link
                                href={mounted ? (settings?.facebookUrl || '#') : '#'}
                                target={mounted && settings?.facebookUrl ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#1877F2]/80 transition-all"
                                aria-label="Facebook"
                            >
                                <Facebook size={20} />
                            </Link>
                            <Link
                                href={mounted ? (settings?.instagramUrl || '#') : '#'}
                                target={mounted && settings?.instagramUrl ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-8">
                            <div className="relative" style={{ width: 180, height: 72 }}>
                                {(!mounted || settingsLoading) ? (
                                    <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
                                ) : (
                                    <Image
                                        src={settings?.logoUrl || "/logo.png"}
                                        alt={settings?.storeName || "Animal Food Express – Meilleur Prix"}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized={true}
                                        sizes="180px"
                                    />
                                )}
                            </div>
                        </Link>
                        <p className="text-[15px] font-medium leading-relaxed text-slate-500 max-w-md mb-8">
                            {(!mounted || settingsLoading) 
                                ? "Votre animalerie en ligne de confiance au Maroc. Qualité, service et amour des animaux sont nos priorités quotidiennes."
                                : (settings?.description || "Votre animalerie en ligne de confiance au Maroc. Qualité, service et amour des animaux sont nos priorités quotidiennes.")
                            }
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex items-center gap-3">
                            <Link
                                href={mounted ? (settings?.facebookUrl || '#') : '#'}
                                target={mounted && settings?.facebookUrl ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="group w-11 h-11 rounded-xl bg-slate-100 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-200"
                            >
                                <Facebook size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                            </Link>
                            <Link
                                href={mounted ? (settings?.instagramUrl || '#') : '#'}
                                target={mounted && settings?.instagramUrl ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="group w-11 h-11 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center transition-all duration-200"
                            >
                                <Instagram size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Service Client */}
                    <div>
                        <h4 className="text-lg font-black uppercase italic text-slate-900 mb-8 tracking-tight">Service Client</h4>
                        <ul className="space-y-4">
                            <li><Link href="/contact" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Contact</Link></li>
                            <li><Link href="/faqs" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">FAQ</Link></li>
                            <li><Link href="/livraison" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Livraison</Link></li>
                            <li><Link href="/retours" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Retours & Échanges</Link></li>
                            {mounted && (
                                <li><Link href="/track" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Suivi de commande</Link></li>
                            )}
                            <li><Link href="/confidentialite" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Confidentialité</Link></li>
                            <li><Link href="/conditions-generales" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Conditions Générales</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-black uppercase italic text-slate-900 mb-8 tracking-tight">Catégories</h4>
                        <ul className="space-y-4">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/products?categoryId=${cat.id}`}
                                        className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            {categories.length === 0 && (
                                <>
                                    <li><Link href="/products?categoryId=chiens" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Chiens</Link></li>
                                    <li><Link href="/products?categoryId=chats" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Chats</Link></li>
                                    <li><Link href="/products?categoryId=oiseaux" className="text-[14px] font-bold text-slate-500 hover:text-[#1A5319] transition-colors uppercase tracking-wide">Oiseaux</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-black uppercase italic text-slate-900 mb-8 tracking-tight">Contact</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <MapPin size={20} className="text-[#1A5319] shrink-0" />
                                <span className="text-[14px] font-medium text-slate-600">
                                    {(!mounted || settingsLoading) ? "Casablanca, Maroc" : (settings?.address || "Casablanca, Maroc")}
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone size={20} className="text-[#1A5319] shrink-0" />
                                <span className="text-[14px] font-black text-slate-900">
                                    {(!mounted || settingsLoading) ? "+212 600 123 456" : (settings?.phoneNumber || "+212 600 123 456")}
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail size={20} className="text-[#1A5319] shrink-0" />
                                <span className="text-[14px] font-black text-slate-900 truncate">
                                    {(!mounted || settingsLoading) ? "contact@petmarket.ma" : (settings?.supportEmail || "contact@petmarket.ma")}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex flex-wrap items-center gap-1.5">
                        © {mounted ? new Date().getFullYear() : '2026'} 
                        <a 
                            href="https://cdigital.ma" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#1A5319] hover:text-[#2E7D32] transition-colors"
                        >
                            cdigital.ma
                        </a> 
                        — Tous droits réservés
                    </p>
                    <div className="flex items-center gap-4">
                        <img src="/visa.png" alt="Visa" className="h-6 object-contain grayscale opacity-50" />
                        <img src="/mastercard.png" alt="Mastercard" className="h-6 object-contain grayscale opacity-50" />
                        <img src="/cmi.png" alt="CMI" className="h-6 object-contain grayscale opacity-50" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

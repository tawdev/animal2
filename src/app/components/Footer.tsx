'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Mail, Phone, MapPin, Facebook, Instagram,
    Send, Shield, Truck, RefreshCcw, HeadphonesIcon,
    ChevronRight, Heart
} from 'lucide-react';
import { api, Category } from '../lib/api';
import { useSettings } from '../context/SettingsContext';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+212773662487';

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

    const storeName  = (!mounted || settingsLoading) ? 'PetMarket Maroc' : (settings?.storeName || 'PetMarket Maroc');
    const storeEmail = (!mounted || settingsLoading) ? 'contact@petmarket.ma' : (settings?.supportEmail || 'contact@petmarket.ma');
    const storePhone = (!mounted || settingsLoading) ? '+212 600 123 456' : (settings?.phoneNumber || '+212 600 123 456');
    const storeAddr  = (!mounted || settingsLoading) ? 'Casablanca, Maroc' : (settings?.address || 'Casablanca, Maroc');
    const storeDesc  = (!mounted || settingsLoading)
        ? 'Votre animalerie en ligne de confiance au Maroc. Qualité, service et amour des animaux sont nos priorités.'
        : (settings?.description || 'Votre animalerie en ligne de confiance au Maroc. Qualité, service et amour des animaux sont nos priorités.');
    const fbUrl      = mounted ? (settings?.facebookUrl  || '#') : '#';
    const igUrl      = mounted ? (settings?.instagramUrl || '#') : '#';
    const logoSrc    = mounted ? (settings?.logoUrl || '/logo.png') : '/logo.png';

    const guarantees = [
        { icon: Truck,            label: 'Livraison rapide',   sub: 'Maroc entier' },
        { icon: Shield,           label: 'Paiement sécurisé',  sub: 'CMI / Carte bancaire' },
        { icon: RefreshCcw,       label: 'Retour facile',      sub: '14 jours' },
        { icon: HeadphonesIcon,   label: 'Support 7j/7',       sub: 'WhatsApp & Email' },
    ];

    const serviceLinks = [
        { href: '/contact',               label: 'Contactez-nous' },
        { href: '/faqs',                  label: 'FAQ' },
        { href: '/livraison',             label: 'Livraison & Délais' },
        { href: '/retours',               label: 'Retours & Échanges' },
        { href: '/track',                 label: 'Suivi de commande' },
        { href: '/confidentialite',       label: 'Politique de confidentialité' },
        { href: '/conditions-generales',  label: 'CGV' },
    ];

    return (
        <footer className="bg-white print:hidden">

            {/* ── Guarantee Strip ──────────────────────────────────────── */}
            <div className="bg-[#F8FBF8] border-y border-[#1A5319]/10">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {guarantees.map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#1A5319]/10 flex items-center justify-center shrink-0">
                                    <Icon size={22} className="text-[#1A5319]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-900 uppercase tracking-wide">{label}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Newsletter ───────────────────────────────────────────── */}
            <div className="bg-[#1A5319]">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
                    <div className="flex items-center gap-5 shrink-0">
                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                            <Send size={26} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Restez informé</h3>
                            <p className="text-white/70 text-sm font-medium">Offres exclusives &amp; conseils vétérinaires</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full max-w-lg bg-white rounded-xl p-1.5 overflow-hidden shadow-xl gap-2 sm:gap-0">
                        <input
                            type="email"
                            placeholder={isSubscribed ? '✓ Inscription réussie !' : 'Votre adresse email…'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                            disabled={isSubscribed}
                            className="flex-1 px-4 sm:px-5 py-3 text-slate-900 font-medium text-sm outline-none border-none disabled:bg-white placeholder:text-slate-400 min-w-0"
                        />
                        <button
                            onClick={handleSubscribe}
                            className={`${isSubscribed ? 'bg-green-500' : 'bg-[#EE8C2B] hover:bg-[#d97b1f]'} text-white px-5 sm:px-7 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto`}
                        >
                            <Send size={14} />
                            {isSubscribed ? 'Merci !' : "S'inscrire"}
                        </button>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Suivez-nous</span>
                        <div className="flex items-center gap-3">
                            <Link href={fbUrl} target={fbUrl !== '#' ? '_blank' : '_self'} rel="noopener noreferrer" aria-label="Facebook"
                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#1877F2] transition-all">
                                <Facebook size={18} />
                            </Link>
                            <Link href={igUrl} target={igUrl !== '#' ? '_blank' : '_self'} rel="noopener noreferrer" aria-label="Instagram"
                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all">
                                <Instagram size={18} />
                            </Link>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, '')}`}
                                target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#25D366] transition-all"
                            >
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Footer Body ─────────────────────────────────────── */}
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-4">
                        <Link href="/" className="inline-block mb-6">
                            <div className="relative w-[200px] h-[68px] sm:w-[230px] sm:h-[76px]">
                                {(!mounted || settingsLoading) ? (
                                    <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
                                ) : (
                                    <Image
                                        src={logoSrc}
                                        alt={storeName}
                                        fill
                                        style={{ objectFit: 'contain', objectPosition: 'left center' }}
                                        unoptimized
                                        sizes="230px"
                                    />
                                )}
                            </div>
                        </Link>

                        <p className="text-[13px] md:text-[14px] font-medium leading-relaxed text-slate-500 mb-6 max-w-sm">
                            {storeDesc}
                        </p>

                        {/* Contact Info */}
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-3">
                                <MapPin size={17} className="text-[#1A5319] shrink-0 mt-0.5" />
                                <span className="text-[13px] font-medium text-slate-600">{storeAddr}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={17} className="text-[#1A5319] shrink-0" />
                                <a href={`tel:${storePhone.replace(/\s/g,'')}`}
                                    className="text-[13px] font-black text-slate-900 hover:text-[#1A5319] transition-colors">
                                    {storePhone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={17} className="text-[#1A5319] shrink-0" />
                                <a href={`mailto:${storeEmail}`}
                                    className="text-[13px] font-black text-slate-900 hover:text-[#1A5319] transition-colors truncate">
                                    {storeEmail}
                                </a>
                            </li>
                        </ul>

                        {/* Social */}
                        <div className="flex items-center gap-3">
                            <Link href={fbUrl} target={fbUrl !== '#' ? '_blank' : '_self'} rel="noopener noreferrer" aria-label="Facebook"
                                className="group w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#1877F2] flex items-center justify-center transition-all">
                                <Facebook size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                            </Link>
                            <Link href={igUrl} target={igUrl !== '#' ? '_blank' : '_self'} rel="noopener noreferrer" aria-label="Instagram"
                                className="group w-10 h-10 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center transition-all">
                                <Instagram size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                            </Link>
                            <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g,'')}`}
                                target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                                className="group w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#25D366] flex items-center justify-center transition-all">
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-slate-500 group-hover:fill-white transition-colors"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Catégories */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4 md:mb-6">Catégories</h4>
                        <ul className="space-y-2.5">
                            {categories.length > 0
                                ? categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link href={`/products?categoryId=${cat.id}`}
                                            className="group flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#1A5319] transition-colors">
                                            <ChevronRight size={13} className="text-[#1A5319]/40 group-hover:text-[#1A5319] transition-colors" />
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                                : ['Chiens', 'Chats', 'Oiseaux', 'Rongeurs', 'Poissons', 'Accessoires'].map(name => (
                                    <li key={name}>
                                        <Link href={`/products?category=${name.toLowerCase()}`}
                                            className="group flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#1A5319] transition-colors">
                                            <ChevronRight size={13} className="text-[#1A5319]/40 group-hover:text-[#1A5319] transition-colors" />
                                            {name}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    {/* Service Client */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4 md:mb-6">Service Client</h4>
                        <ul className="space-y-2.5">
                            {serviceLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href}
                                        className="group flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#1A5319] transition-colors">
                                        <ChevronRight size={13} className="text-[#1A5319]/40 group-hover:text-[#1A5319] transition-colors" />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Horaires + Quick Contact */}
                    <div className="col-span-2 lg:col-span-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-6">Horaires d&apos;ouverture</h4>
                        <ul className="space-y-2 mb-8">
                            {[
                                { day: 'Lun – Ven', hours: '08h00 – 19h00' },
                                { day: 'Samedi',    hours: '09h00 – 17h00' },
                                { day: 'Dimanche',  hours: 'Fermé' },
                            ].map(({ day, hours }) => (
                                <li key={day} className="flex items-center justify-between text-[13px]">
                                    <span className="font-semibold text-slate-600">{day}</span>
                                    <span className={`font-black ${hours === 'Fermé' ? 'text-red-400' : 'text-[#1A5319]'}`}>{hours}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-[#F8FBF8] rounded-2xl p-5 border border-[#1A5319]/10">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#1A5319] mb-3">Besoin d&apos;aide ?</p>
                            <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g,'')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-xl text-[13px] font-black hover:bg-[#1ebe5d] transition-all mb-3">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                            </a>
                            <a href={`mailto:${storeEmail}`}
                                className="flex items-center gap-3 bg-white text-slate-700 border border-slate-200 px-4 py-3 rounded-xl text-[13px] font-black hover:border-[#1A5319] hover:text-[#1A5319] transition-all">
                                <Mail size={15} className="shrink-0" />
                                {storeEmail}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Bar ───────────────────────────────────────────── */}
            <div className="border-t border-slate-100">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Copyright */}
                        <p className="text-[11px] font-semibold text-slate-400 flex flex-wrap items-center gap-1.5 text-center md:text-left">
                            © {mounted ? new Date().getFullYear() : '2026'}&nbsp;{storeName}
                            &nbsp;—&nbsp;Conçu avec <Heart size={11} className="text-red-400 inline" /> par&nbsp;
                            <a
                                href="https://cdigital.ma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-black text-[#1A5319] hover:text-[#2E7D32] underline underline-offset-2 transition-colors"
                            >
                                CDigital.ma
                            </a>
                            &nbsp;— Tous droits réservés
                        </p>

                        {/* Payment Logos */}
                        <div className="flex items-center gap-4 shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Paiement sécurisé</span>
                            <img src="/visa.png"       alt="Visa"       className="h-6 object-contain grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all" />
                            <img src="/mastercard.png" alt="Mastercard" className="h-6 object-contain grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all" />
                            <img src="/cmi.png"        alt="CMI"        className="h-6 object-contain grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all" />
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
}

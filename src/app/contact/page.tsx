'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ShieldCheck, Headphones, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { api } from '@/app/lib/api';

export default function ContactPage() {
    const { settings, loading: settingsLoading } = useSettings();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const storeName = settings?.storeName || "Animal Food Express";
    const storeAddressLine1 = settings?.address || "48 Lot IGUIDER, Allal El Fassi, Marrakech";
    const storeAddressLine2 = "Marrakech, Maroc";
    const mapQuery = "48 Lot IGUIDER, Allal El Fassi, Marrakech";

    const coordPhone = settings?.phoneNumber || "+212 6 00 00 00 00";
    const coordPhoneHours = "Lun-Sam 8h à 19h";
    const coordEmail = settings?.supportEmail || "contact@animalfood.com";
    const coordEmailDesc = "Réponse sous 24h ouvrées";

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            subject: formData.get('_subject') as string,
            message: formData.get('message') as string,
        };
        
        try {
            // 1. Save in Admin Database
            const res = await api.submitInquiry(data);
            
            // 2. Prepare WhatsApp message
            const waPhone = coordPhone.replace(/\D/g, '');
            const waMessage = `*Nouveau Message Contact*\n\n*Nom:* ${data.name}\n*Email:* ${data.email}\n*Sujet:* ${data.subject}\n*Message:* ${data.message}`;
            const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;
            
            // 3. Status success
            setStatus('success');
            (e.target as HTMLFormElement).reset();
            
            // 4. Open WhatsApp after a small delay
            setTimeout(() => {
                window.open(waUrl, '_blank');
                setStatus('idle');
            }, 1000);

        } catch (error) {
            console.error('Contact error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    if (!mounted || settingsLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
                <div className="w-10 h-10 border-4 border-[#1A5319] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white border-b border-slate-200 pt-20 pb-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase italic">
                        Contactez <span className="text-[#1A5319]">Nous</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed italic">
                        Une question sur nos produits ou besoin d'un conseil en nutrition pour votre animal ? Nos experts de <span className="text-[#1A5319] font-black">{storeName}</span> sont à votre écoute 7j/7.
                    </p>
                </div>
            </motion.div>

            <main className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16">
                    <motion.section 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 transition-all hover:shadow-2xl relative overflow-hidden"
                    >
                        <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase italic tracking-tight underline decoration-[#1A5319]/20 decoration-4 underline-offset-8">
                            Envoyez-nous un message
                        </h3>
                        
                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200">
                                <CheckCircle2 className="shrink-0" />
                                <p className="font-medium text-sm">Votre message a été envoyé avec succès ! Nous vous répondrons très vite.</p>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                                <XCircle className="shrink-0" />
                                <p className="font-medium text-sm">Une erreur s'est produite lors de l'envoi. Veuillez réessayer.</p>
                            </div>
                        )}
 
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <input type="hidden" name="_template" value="table" />
                            <input type="hidden" name="_captcha" value="false" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Nom Complet</label>
                                    <input 
                                        name="name"
                                        required
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium text-slate-900" 
                                        placeholder="Votre nom" 
                                        type="text" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Adresse Email</label>
                                    <input 
                                        name="email"
                                        required
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium text-slate-900" 
                                        placeholder="email@exemple.com" 
                                        type="email" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Sujet</label>
                                <input 
                                    name="_subject"
                                    required
                                    className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium text-slate-900" 
                                    placeholder="De quoi souhaitez-vous discuter ?" 
                                    type="text" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Votre Message</label>
                                <textarea 
                                    name="message"
                                    required
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 focus:bg-white focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none resize-none font-medium text-slate-900" 
                                    placeholder="Dites-nous tout..." 
                                    rows={6}
                                ></textarea>
                            </div>
                            <button 
                                disabled={status === 'loading'}
                                className="w-full h-16 bg-[#1A5319] hover:bg-[#004d26] disabled:bg-[#1A5319]/70 disabled:cursor-not-allowed disabled:scale-100 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#1A5319]/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm" 
                                type="submit"
                            >
                                {status === 'loading' ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Envoyer le Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.section>
 
                    {/* Info Section */}
                    <motion.section 
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="space-y-10"
                    >
                        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A5319] opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <h3 className="text-xl font-black mb-10 uppercase italic tracking-tight border-l-4 border-[#1A5319] pl-4">Coordonnées</h3>
                            
                            <div className="space-y-8">
                                <div className="flex gap-5 group">
                                    <div className="shrink-0 h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#1A5319] border border-white/10 group-hover:bg-[#1A5319] group-hover:text-white transition-all">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#1A5319] uppercase tracking-[0.2em] mb-1">Téléphone</p>
                                        <p className="text-lg font-bold text-white">{coordPhone}</p>
                                        <p className="text-xs text-slate-400 font-medium italic">{coordPhoneHours}</p>
                                    </div>
                                </div>
 
                                <div className="flex gap-5 group">
                                    <div className="shrink-0 h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#1A5319] border border-white/10 group-hover:bg-[#1A5319] group-hover:text-white transition-all">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#1A5319] uppercase tracking-[0.2em] mb-1">Email</p>
                                        <p className="text-lg font-bold text-white">{coordEmail}</p>
                                        <p className="text-xs text-slate-400 font-medium italic">{coordEmailDesc}</p>
                                    </div>
                                </div>
 
                                <div className="flex gap-5 group">
                                    <div className="shrink-0 h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#1A5319] border border-white/10 group-hover:bg-[#1A5319] group-hover:text-white transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#1A5319] uppercase tracking-[0.2em] mb-1">Adresse</p>
                                        <p className="text-lg font-bold text-white">{storeAddressLine1}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
 
                        {/* Trust Badge Card */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#1A5319]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="text-[#1A5319]" size={28} />
                                <h4 className="font-black text-slate-900 uppercase italic tracking-tight">Expertise Garantie</h4>
                            </div>
                            <p className="text-[15px] text-slate-500 font-medium leading-relaxed italic">
                                Nos experts en nutrition sont à votre disposition pour des conseils personnalisés sur la santé et le bien-être de vos animaux.
                            </p>
                        </div>
 
                        {/* WhatsApp Shortcuts */}
                        <a 
                            href={`https://wa.me/${coordPhone.replace(/\D/g, '')}?text=${encodeURIComponent("Bonjour, je souhaite discuter avec un expert.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-6 bg-[#25D366]/5 border border-[#25D366]/20 rounded-3xl group hover:bg-[#25D366] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#25D366] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#25D366]/20 group-hover:bg-white group-hover:text-[#25D366]">
                                    <MessageCircle size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-[#25D366] uppercase group-hover:text-white">Assistance WhatsApp</p>
                                    <p className="text-xs text-slate-500 font-bold group-hover:text-white/80">Discutez avec un expert</p>
                                </div>
                            </div>
                            <div className="text-slate-300 group-hover:text-white transition-colors">
                                <Clock size={20} />
                            </div>
                        </a>
                    </motion.section>
                </div>

                {/* Map Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-24 rounded-[48px] overflow-hidden shadow-2xl border-8 border-white relative h-[500px] w-full bg-slate-100 group"
                >
                    <iframe 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery + " (Animal Food Express)")}&t=&z=15&ie=UTF8&iwloc=B&output=embed`}
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 0 }}
                        loading="lazy"
                    ></iframe>
                    
                    {/* Subtle overlay that disappears on interact to make it blend better initially */}
                    <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>

                    <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute top-6 left-6 bg-white hover:bg-slate-50 text-[#1a73e8] font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-2 text-sm transition-transform hover:scale-105 active:scale-95"
                    >
                        Open in Maps
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                </motion.div>
            </main>
        </div>
    );
}

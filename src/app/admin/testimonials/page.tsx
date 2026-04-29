'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, type Testimonial } from '@/app/lib/api';
import { useNotification } from '@/app/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Quote,
    X,
    Save,
    User,
    CheckCircle2
} from 'lucide-react';

export default function AdminTestimonialsPage() {
    const { showToast } = useNotification();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getTestimonials();
            setTestimonials(data);
        } catch (err) {
            console.error(err);
            showToast('Erreur lors du chargement des témoignages', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTestimonial?.name || !editingTestimonial?.content) {
            showToast('Veuillez remplir le nom et le contenu', 'error');
            return;
        }

        try {
            setSaving(true);
            // Derived initial if not provided
            const initial = editingTestimonial.name.substring(0, 2).toUpperCase();
            const dataToSave = { ...editingTestimonial, initial: editingTestimonial.initial || initial };

            if (editingTestimonial.id) {
                const updated = await api.updateTestimonial(editingTestimonial.id, dataToSave);
                setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? updated : t));
                showToast('Témoignage mis à jour', 'success');
            } else {
                const created = await api.createTestimonial(dataToSave);
                setTestimonials(prev => [created, ...prev]);
                showToast('Témoignage créé', 'success');
            }
            setIsModalOpen(false);
            setEditingTestimonial(null);
        } catch (err) {
            showToast('Erreur lors de la sauvegarde', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce témoignage ?')) return;
        try {
            await api.deleteTestimonial(id);
            setTestimonials(prev => prev.filter(t => t.id !== id));
            showToast('Témoignage supprimé', 'success');
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const filteredTestimonials = testimonials.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Gestion des <span className="text-primary">Témoignages</span></h2>
                        <p className="text-slate-500 mt-1 font-medium italic">Gérez les avis de vos clients affichés sur la page d&apos;accueil.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingTestimonial({ name: '', role: '', content: '', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-6 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    >
                        <Plus size={20} />
                        Nouveau témoignage
                    </button>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Rechercher par nom ou contenu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 h-16 rounded-[24px] border border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-slate-900"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-48 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                        ))
                    ) : filteredTestimonials.length === 0 ? (
                        <div className="md:col-span-2 bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center">
                            <Quote size={64} className="text-slate-200 mb-6" />
                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Aucun témoignage trouvé</h3>
                            <p className="text-slate-500 font-medium italic mt-2">Commencez par ajouter votre premier avis client !</p>
                        </div>
                    ) : (
                        filteredTestimonials.map((testimonial) => (
                            <motion.div 
                                layout
                                key={testimonial.id}
                                className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 hover:shadow-md transition-shadow group flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl italic uppercase border-2 border-primary/20">
                                            {testimonial.initial || testimonial.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight italic uppercase">{testimonial.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => {
                                                setEditingTestimonial(testimonial);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(testimonial.id)}
                                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <Quote size={24} className="absolute -top-2 -left-2 text-slate-100 rotate-180" />
                                    <p className="text-slate-600 font-medium leading-relaxed italic relative z-10">
                                        &quot;{testimonial.content}&quot;
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`size-2 rounded-full ${testimonial.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{testimonial.isActive ? 'Visible' : 'Masqué'}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                                        {new Date(testimonial.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <Quote className="text-primary" size={24} />
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">
                                        {editingTestimonial?.id ? 'Modifier le témoignage' : 'Nouveau témoignage'}
                                    </h3>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Nom du Client</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input 
                                                autoFocus
                                                value={editingTestimonial?.name || ''}
                                                onChange={(e) => setEditingTestimonial(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-slate-900"
                                                placeholder="Ex: Mohammed Alami"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Rôle / Localisation</label>
                                        <input 
                                            value={editingTestimonial?.role || ''}
                                            onChange={(e) => setEditingTestimonial(prev => ({ ...prev, role: e.target.value }))}
                                            className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-slate-900"
                                            placeholder="Ex: Propriétaire de Labrador — Casa"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Initiales (Optionnel)</label>
                                    <input 
                                        maxLength={2}
                                        value={editingTestimonial?.initial || ''}
                                        onChange={(e) => setEditingTestimonial(prev => ({ ...prev, initial: e.target.value.toUpperCase() }))}
                                        className="w-24 h-14 px-6 text-center rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none font-black text-slate-900"
                                        placeholder="MA"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Contenu du témoignage</label>
                                    <textarea 
                                        rows={5}
                                        value={editingTestimonial?.content || ''}
                                        onChange={(e) => setEditingTestimonial(prev => ({ ...prev, content: e.target.value }))}
                                        className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-slate-900 resize-none italic"
                                        placeholder="Décrivez l'avis du client..."
                                    />
                                </div>
                                
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <input 
                                        type="checkbox"
                                        id="testimonial-active"
                                        checked={editingTestimonial?.isActive ?? true}
                                        onChange={(e) => setEditingTestimonial(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="size-5 rounded border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer"
                                    />
                                    <label htmlFor="testimonial-active" className="text-sm font-bold text-slate-700 cursor-pointer">Témoignage Actif (Visible sur le site)</label>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-16 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        disabled={saving}
                                        type="submit"
                                        className="flex-[2] h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-70"
                                    >
                                        {saving ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

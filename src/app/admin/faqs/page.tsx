'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, type Faq } from '@/app/lib/api';
import { useNotification } from '@/app/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    ChevronDown, 
    ChevronUp, 
    HelpCircle,
    CheckCircle2,
    X,
    Save,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';

export default function AdminFaqsPage() {
    const { showToast } = useNotification();
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Partial<Faq> | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getFaqs();
            setFaqs(data);
        } catch (err) {
            console.error(err);
            showToast('Erreur lors du chargement des FAQs', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFaq?.question || !editingFaq?.answer) {
            showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        try {
            setSaving(true);
            if (editingFaq.id) {
                const updated = await api.updateFaq(editingFaq.id, editingFaq);
                setFaqs(prev => prev.map(f => f.id === editingFaq.id ? updated : f));
                showToast('FAQ mise à jour', 'success');
            } else {
                const created = await api.createFaq(editingFaq);
                setFaqs(prev => [created, ...prev]);
                showToast('FAQ créée', 'success');
            }
            setIsModalOpen(false);
            setEditingFaq(null);
        } catch (err) {
            showToast('Erreur lors de la sauvegarde', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer cette FAQ ?')) return;
        try {
            await api.deleteFaq(id);
            setFaqs(prev => prev.filter(f => f.id !== id));
            showToast('FAQ supprimée', 'success');
        } catch (err) {
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(search.toLowerCase()) || 
        f.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Gestion des <span className="text-primary">FAQs</span></h2>
                        <p className="text-slate-500 mt-1 font-medium italic">Gérez les questions fréquentes de vos clients.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingFaq({ question: '', answer: '', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-6 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    >
                        <Plus size={20} />
                        Ajouter une FAQ
                    </button>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Rechercher dans les questions ou réponses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 h-16 rounded-[24px] border border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-slate-900"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                        ))
                    ) : filteredFaqs.length === 0 ? (
                        <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center">
                            <HelpCircle size={64} className="text-slate-200 mb-6" />
                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Aucune FAQ trouvée</h3>
                            <p className="text-slate-500 font-medium italic mt-2">Commencez par ajouter votre première question !</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFaqs.map((faq) => (
                                <motion.div 
                                    layout
                                    key={faq.id}
                                    className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-3 rounded-full ${faq.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight italic">{faq.question}</h3>
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                                                {faq.answer}
                                            </p>
                                            <div className="flex items-center gap-6 pt-2">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <ThumbsUp size={16} />
                                                    <span className="text-xs font-black">{faq.likes || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <ThumbsDown size={16} />
                                                    <span className="text-xs font-black">{faq.dislikes || 0}</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                    Créé le {new Date(faq.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                                            <button 
                                                onClick={() => {
                                                    setEditingFaq(faq);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(faq.id)}
                                                className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
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
                                <h3 className="text-xl font-black text-slate-900 uppercase italic">
                                    {editingFaq?.id ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Question</label>
                                    <input 
                                        autoFocus
                                        value={editingFaq?.question || ''}
                                        onChange={(e) => setEditingFaq(prev => ({ ...prev, question: e.target.value }))}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-slate-900"
                                        placeholder="Ex: Livrez-vous à domicile ?"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Réponse</label>
                                    <textarea 
                                        rows={5}
                                        value={editingFaq?.answer || ''}
                                        onChange={(e) => setEditingFaq(prev => ({ ...prev, answer: e.target.value }))}
                                        className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-slate-900 resize-none italic"
                                        placeholder="Décrivez la réponse en détail..."
                                    />
                                </div>
                                
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <input 
                                        type="checkbox"
                                        id="faq-active"
                                        checked={editingFaq?.isActive ?? true}
                                        onChange={(e) => setEditingFaq(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="size-5 rounded border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer"
                                    />
                                    <label htmlFor="faq-active" className="text-sm font-bold text-slate-700 cursor-pointer">Question Active (Visible sur le site)</label>
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

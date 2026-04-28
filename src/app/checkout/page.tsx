
export default function CheckoutPage() {
  return (
    <>
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased" style={{ '--primary': '#1A5319', '--accent': '#EE8C2B', '--background-light': '#f6f6f8', '--background-dark': '#101622', '--radius': '0.25rem', '--radius-lg': '0.5rem', '--radius-xl': '0.75rem', '--radius-full': '9999px', '--font-display': 'Inter' } as React.CSSProperties}>

        <div className="relative flex w-full flex-col">

          <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-8 lg:px-10 lg:py-12">
            <div className="mb-8 border-b border-slate-100 pb-8">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50 lg:text-5xl uppercase tracking-tighter">
                Finaliser la <span className="text-[#1A5319]">Commande</span>
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium italic">Veuillez fournir vos détails pour compléter l'achat de vos produits PetMarket.</p>
            </div>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

              <div className="lg:col-span-7">
                <section className="space-y-8">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50 mb-6 uppercase italic tracking-tight border-l-4 border-[#1A5319] pl-4">
                      Informations Personnelles
                    </h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nom Complet</span>
                        <input className="rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium" placeholder="Votre nom" type="text" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Numéro de Téléphone</span>
                        <input className="rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium" placeholder="+212 6XX XX XX XX" type="tel" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Adresse Email</span>
                        <input className="rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium" placeholder="votre@email.com" type="email" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50 mb-6 uppercase italic tracking-tight border-l-4 border-[#1A5319] pl-4">
                      Détails de Livraison
                    </h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Adresse de Livraison</span>
                        <input className="rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium" placeholder="Ville, Quartier, Rue..." type="text" />
                      </label>
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Notes de commande (Optionnel)</span>
                        <textarea className="rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-[#1A5319] focus:ring-4 focus:ring-[#1A5319]/5 transition-all outline-none font-medium" placeholder="Instructions spéciales pour la livraison..." rows={3}></textarea>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="w-full rounded-2xl bg-[#1A5319] px-8 py-5 text-lg font-black text-white shadow-xl shadow-[#1A5319]/20 transition-all hover:bg-[#004d26] hover:shadow-2xl active:scale-[0.98] uppercase tracking-widest">
                      Confirmer la Commande
                    </button>
                    <p className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Paiement sécurisé et confidentiel
                    </p>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-8 rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A5319] rounded-full blur-[80px] opacity-20 pointer-events-none" />
                  
                  <h3 className="mb-8 text-2xl font-black uppercase tracking-tighter relative z-10">Résumé de la Commande</h3>
                  <div className="mb-8 space-y-4 max-h-[400px] overflow-y-auto pr-2 relative z-10">

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group">
                      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-white border border-white/10">
                        <img className="h-full w-full object-cover group-hover:scale-110 transition-transform" alt="Alimentation Premium Chien" src="https://images.unsplash.com/photo-1589924691106-073b19f56586?q=80&w=2070&auto=format&fit=crop" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="font-bold text-white text-sm">Croquettes Premium Chien</span>
                        <span className="text-xs text-white/50">Qté: 1</span>
                      </div>
                      <span className="font-black text-[#1A5319]">450,00 MAD</span>
                    </div>

                  </div>
                  <div className="border-t border-white/10 pt-6 space-y-4 relative z-10">
                    <div className="flex justify-between text-white/60 font-bold uppercase tracking-widest text-[10px]">
                      <span>Sous-total</span>
                      <span>450,00 MAD</span>
                    </div>
                    <div className="flex justify-between text-white/60 font-bold uppercase tracking-widest text-[10px]">
                      <span>Livraison</span>
                      <span className="text-[#1A5319]">35,00 MAD</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-white/10 items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A5319] mb-1">Total</p>
                        <p className="text-4xl font-black tracking-tighter">485,00 <span className="text-lg">MAD</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}



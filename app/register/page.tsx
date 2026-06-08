"use client";

import React, { useState } from "react";
import { Loader2, Building2, Globe, Mail, CreditCard, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CORREZIONE: Puntiamo alla rotta corretta /api/checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Errore Stripe: " + (data.error || "Riprova tra poco."));
        setLoading(false);
      }
    } catch (error) {
      console.error("Errore Onboarding:", error);
      alert("Errore di connessione. Verifica che il server sia attivo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#475569] font-sans antialiased relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 z-0"></div>
      
      <header className="w-full max-w-7xl mx-auto px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl text-[#1e293b] tracking-tighter italic">
            RealEstate<span className="text-[#4f46e5] not-italic">SaaS</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-2xl text-xs font-bold uppercase tracking-widest border border-indigo-100">
              <Sparkles className="w-4 h-4" /> Piano Premium Agency
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-[#1e293b] tracking-tight leading-[1.05]">
              Porta la tua agenzia nel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">futuro digitale</span>.
            </h1>
            <p className="text-xl text-[#64748b] leading-relaxed max-w-lg">
              L'unica piattaforma all-in-one pensata per i top player del settore immobiliare.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Catalogo 4K Dinamico",
                "SEO & Slug Personalizzati",
                "Supporto Prioritario 24/7",
                "Nessuna Commissione",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-sm text-[#334155]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative">
            <h2 className="text-3xl font-black text-[#1e293b] mb-2">Inizia ora</h2>
            <p className="text-[#64748b] mb-8 font-medium">Configura il tuo workspace in un clic.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Nome Agenzia</label>
                <input
                  type="text" required placeholder="Es. Tecnocasa Roma"
                  value={formData.name} onChange={handleNameChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">URL Personalizzato</label>
                <div className="relative">
                  <span className="absolute left-6 inset-y-0 flex items-center text-slate-400 font-bold text-sm">/</span>
                  <input
                    type="text" required placeholder="nome-agenzia"
                    value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-indigo-600 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Email Business</label>
                <input
                  type="email" required placeholder="admin@agenzia.it"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="p-6 bg-slate-900 rounded-[1.5rem] flex items-center justify-between shadow-xl shadow-slate-200">
                <div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Abbonamento Mensile</p>
                  <p className="text-3xl font-black text-white italic">€279<span className="text-sm font-normal text-slate-400 not-italic">/mese</span></p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-5 rounded-2xl shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Attiva Workspace"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
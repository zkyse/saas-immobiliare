"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/supabase";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Mail, Phone, Shield, Loader2, UserMinus } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}

export default function DashboardAgenti({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stati del Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agente");
  const [phone, setPhone] = useState("");

  async function loadAgents() {
    setLoading(true);
    
    // 1. Recupera Tenant
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenantData) return;
    setTenantId(tenantData.id);

    // 2. Recupera gli agenti legati a questo tenant
    const { data: agentsData } = await supabase
      .from("agents")
      .select("id, name, email, role, phone")
      .eq("tenant_id", tenantData.id)
      .order("created_at", { ascending: true });

    if (agentsData) setAgents(agentsData);
    setLoading(false);
  }

  useEffect(() => {
    loadAgents();
  }, [slug]);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !name || !email) return;

    setSubmitting(true);

    const { error } = await supabase.from("agents").insert({
      tenant_id: tenantId,
      name,
      email,
      role,
      phone: phone || null,
    });

    if (!error) {
      // Resetta il form
      setName("");
      setEmail("");
      setPhone("");
      setRole("Agente");
      // Ricarica la lista aggiornata
      await loadAgents();
    }
    setSubmitting(false);
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Sei sicuro di voler rimuovere questo agente dal team?")) return;

    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (!error) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href={`/${slug}/dashboard`} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Gestione Agenti & Team</h1>
          <p className="text-xs text-slate-500 font-medium">Gestisci l'organico della tua agenzia, i membri del team e i ruoli</p>
        </div>
      </header>

      {/* Contenuto principale */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MODULO AGGIUNGI MEMBRO */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Aggiungi al Team</h2>
          
          <form onSubmit={handleAddAgent} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Es. Alessandro Verdi" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Aziendale *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nome@agenzia.it" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Telefono</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Ruolo Aziendale</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-600">
                <option value="Agente">Agente Immobiliare</option>
                <option value="Coordinatore">Coordinatore d'Ufficio</option>
                <option value="Amministratore">Amministratore</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              Inserisci nel Team
            </button>
          </form>
        </div>

        {/* LISTA MEMBRI DEL TEAM */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Membri Attivi ({agents.length})</h2>
          
          <div className="flex-1 space-y-3 overflow-y-auto architecture-list">
            {agents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Users className="mx-auto text-slate-300" size={36} />
                <p className="text-sm font-medium">Nessun agente registrato</p>
                <p className="text-xs text-slate-400">Il tuo ufficio è vuoto. Aggiungi i tuoi collaboratori dal modulo a sinistra.</p>
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="p-4 bg-slate-50/60 border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 hover:border-slate-300 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{agent.name}</h3>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                        <Shield size={10} className="text-slate-400" /> {agent.role}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Mail size={12} /> {agent.email}</span>
                      {agent.phone && <span className="flex items-center gap-1"><Phone size={12} /> {agent.phone}</span>}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Rimuovi dal team"
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
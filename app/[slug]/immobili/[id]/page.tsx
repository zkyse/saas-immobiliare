"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/supabase";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Loader2, RealEstate, 
  Trash2, Building2, Euro, Maximize2 
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  sqm: number;
  type: string;
  status: string;
}

export default function DashboardProperties({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stati del Form Immobile
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sqm, setSqm] = useState("");
  const [type, setType] = useState("Appartamento");
  const [status, setStatus] = useState("Vendita");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [agentId, setAgentId] = useState(""); // <--- Stato per memorizzare l'agente scelto

  async function loadDashboardData() {
    setLoading(true);

    // 1. Recupera il Tenant corrente dallo slug
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenantData) return;
    setTenantId(tenantData.id);

    // 2. Recupera la lista degli immobili del tenant
    const { data: propertiesData } = await supabase
      .from("properties")
      .select("id, title, price, sqm, type, status")
      .eq("tenant_id", tenantData.id)
      .order("created_at", { ascending: false });

    if (propertiesData) setProperties(propertiesData);

    // 3. Recupera la lista degli agenti disponibili per il menu a tendina
    const { data: agentsData } = await supabase
      .from("agents")
      .select("id, name, role")
      .eq("tenant_id", tenantData.id)
      .order("name", { ascending: true });

    if (agentsData) setAgents(agentsData);

    setLoading(false);
  }

  useEffect(() => {
    loadDashboardData();
  }, [slug]);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !title || !price) return;

    setSubmitting(true);

    // Inserisce il nuovo immobile includendo la colonna relation agent_id
    const { error } = await supabase.from("properties").insert({
      tenant_id: tenantId,
      title,
      price: parseFloat(price),
      sqm: sqm ? parseInt(sqm) : null,
      type,
      status,
      description,
      image_url: imageUrl || null,
      rooms: rooms ? parseInt(rooms) : 1,
      bathrooms: bathrooms ? parseInt(bathrooms) : 1,
      agent_id: agentId || null, // <--- Assegna l'ID dell'agente selezionato (o null)
    });

    if (!error) {
      // Resetta i campi del form
      setTitle("");
      setPrice("");
      setSqm("");
      setDescription("");
      setImageUrl("");
      setRooms("");
      setBathrooms("");
      setAgentId(""); // Resetta il selettore agente
      await loadDashboardData(); // Rinfresca la lista
    } else {
      alert(`Errore durante il salvataggio: ${error.message}`);
    }

    setSubmitting(false);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Vuoi davvero eliminare questo annuncio?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      setProperties(prev => prev.filter(p => p.id !== id));
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
          <h1 className="text-xl font-bold tracking-tight">Gestione Annunci Immobiliari</h1>
          <p className="text-xs text-slate-500 font-medium">Pubblica nuovi immobili e assegna i tuoi agenti di riferimento</p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MODULO DI CREAZIONE */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Nuovo Annuncio</h2>
          
          <form onSubmit={handleCreateProperty} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Titolo Annuncio *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Es. Trilocale con terrazzo vista parco" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Prezzo (€) *</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="250000" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Superficie (m²)</label>
                <input type="number" value={sqm} onChange={(e) => setSqm(e.target.value)} placeholder="90" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Locali</label>
                <input type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="3" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bagni</label>
                <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Contratto</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-600">
                  <option value="Vendita">Vendita</option>
                  <option value="Affitto">Affitto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tipologia</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-600">
                  <option value="Appartamento">Appartamento</option>
                  <option value="Villa">Villa</option>
                  <option value="Attico">Attico/Mansarda</option>
                  <option value="Ufficio">Ufficio</option>
                </select>
              </div>
            </div>

            {/* MENU A TENDINA AGENTE RESPONSABILE */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Agente Responsabile</label>
              <select 
                value={agentId} 
                onChange={(e) => setAgentId(e.target.value)} 
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-600 text-slate-700"
              >
                <option value="">Nessun agente (Assegna alla Sede centrale)</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">URL Immagine di Copertina</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrizione dell'immobile</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descrivi le caratteristiche principali..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600 resize-none" />
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              Pubblica Immobile
            </button>
          </form>
        </div>

        {/* LISTA IMMOBILI ESISTENTI */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Annunci Attivi ({properties.length})</h2>
          
          <div className="flex-1 space-y-3 overflow-y-auto architecture-list">
            {properties.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Building2 className="mx-auto text-slate-300" size={36} />
                <p className="text-sm font-medium">Nessun immobile pubblicato</p>
                <p className="text-xs text-slate-400">Compila il modulo di sinistra per caricare la prima proposta sul portale.</p>
              </div>
            ) : (
              properties.map((prop) => (
                <div key={prop.id} className="p-4 bg-slate-50/60 border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 hover:border-slate-300 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{prop.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                        prop.status === "Vendita" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}>
                        {prop.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Building2 size={12} /> {prop.type}</span>
                      <span className="flex items-center gap-1"><Euro size={12} /> {prop.price.toLocaleString("it-IT")}</span>
                      {prop.sqm && <span className="flex items-center gap-1"><Maximize2 size={12} /> {prop.sqm} m²</span>}
                    </div>
                  </div>

                  <button onClick={() => handleDeleteProperty(prop.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                    <Trash2 size={18} />
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
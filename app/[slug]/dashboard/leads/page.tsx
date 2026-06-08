"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/supabase";
import Link from "next/link";
import { 
  Mail, Phone, Calendar, User, 
  Building2, ArrowLeft, MessageSquare, 
  Loader2, ExternalLink 
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  property_id: string;
  is_read: boolean; // <--- Aggiunto il tipo boolean per la nuova colonna
  properties: {
    title: string;
    price: number;
  } | null;
}

interface Tenant {
  id: string;
  name: string;
}

export default function DashboardLeads({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Funzione per segnare un singolo lead come letto sul DB e nello stato locale
  const handleSelectLead = async (lead: Lead) => {
    setSelectedLead(lead);

    // Se è già letto, non facciamo chiamate inutili al database
    if (lead.is_read) return;

    // Aggiorna sul Database
    const { error } = await supabase
      .from("leads")
      .update({ is_read: true })
      .eq("id", lead.id);

    if (!error) {
      // Aggiorna lo stato locale per far sparire il pallino blu in tempo reale
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l.id === lead.id ? { ...l, is_read: true } : l))
      );
    }
  };

  useEffect(() => {
    async function loadDashboardLeads() {
      setLoading(true);

      // 1. Recuperiamo il tenant corrente per sicurezza e per i titoli
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id, name")
        .eq("slug", slug)
        .single();

      if (!tenantData) {
        setLoading(false);
        return;
      }
      setTenant(tenantData);

      // 2. Recuperiamo i lead unendoli (JOIN) con le informazioni dell'immobile associato (Inclusa la colonna is_read)
      const { data: leadsData, error } = await supabase
        .from("leads")
        .select(`
          id,
          name,
          email,
          phone,
          message,
          created_at,
          property_id,
          is_read,
          properties (
            title,
            price
          )
        `)
        .eq("tenant_id", tenantData.id)
        .order("created_at", { ascending: false });

      if (leadsData) {
        const typedLeads = leadsData as unknown as Lead[];
        setLeads(typedLeads);
        
        if (typedLeads.length > 0) {
          // Seleziona il primo di default e lo segna come letto
          handleSelectLead(typedLeads[0]);
        }
      }
      setLoading(false);
    }

    loadDashboardLeads();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Caricamento messaggi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
      
      {/* HEADER DELLA DASHBOARD */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${slug}/dashboard`} 
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Richieste di Contatto</h1>
            <p className="text-xs text-slate-500 font-medium">Gestisci i lead ricevuti da {tenant?.name}</p>
          </div>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100">
          Totale: {leads.length} lead
        </span>
      </header>

      {/* CONTENITORE PRINCIPALE: SPLIT LAYOUT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* COLONNA DI SINISTRA: ELENCO DEI MESSAGGI */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">In arrivo</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {leads.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 space-y-2">
                <MessageSquare className="mx-auto text-slate-300" size={32} />
                <p className="text-sm font-medium">Nessun messaggio ricevuto</p>
                <p className="text-xs text-slate-400">I contatti dal sito pubblico appariranno qui automaticamente.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => handleSelectLead(lead)} // <--- Usa la nuova funzione al click
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 hover:bg-slate-50/80 relative ${
                    selectedLead?.id === lead.id ? "bg-indigo-50/60 border-l-4 border-indigo-600" : ""
                  }`}
                >
                  <div className="flex justify-between items-start w-full gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Pallino blu di notifica per messaggi non letti */}
                      {!lead.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" title="Non letto" />
                      )}
                      <span className={`text-sm line-clamp-1 ${!lead.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                        {lead.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
                      {new Date(lead.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 line-clamp-1">
                    {lead.properties?.title || "Richiesta Generale"}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {lead.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* COLONNA DI DESTRA: DETTAGLIO COMPLETO DEL LEAD SELEZIONATO */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          {selectedLead ? (
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* BADGE DI INTESTAZIONE */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {selectedLead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> Ricevuto il {new Date(selectedLead.created_at).toLocaleString("it-IT")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTATTI DIRETTI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href={`mailto:${selectedLead.email}`}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition text-left group"
                >
                  <Mail className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={18} />
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Invia Email</span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors break-all">{selectedLead.email}</span>
                  </div>
                 </a>
                
                <a 
                  href={`tel:${selectedLead.phone}`}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition text-left group"
                >
                  <Phone className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={18} />
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Chiama al Telefono</span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{selectedLead.phone}</span>
                  </div>
                </a>
              </div>

              {/* INFO SULL'IMMOBILE DI INTERESSE */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Building2 size={14} /> Immobile Richiesto
                </div>
                {selectedLead.properties ? (
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{selectedLead.properties.title}</h4>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">
                        € {selectedLead.properties.price.toLocaleString("it-IT")}
                      </p>
                    </div>
                    <Link 
                      href={`/${slug}/immobili/${selectedLead.property_id}`}
                      target="_blank"
                      className="text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
                    >
                      Apri scheda <ExternalLink size={12} />
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500 pt-1">Richiesta di contatto generica (Nessun immobile specifico agganciato).</p>
                )}
              </div>

              {/* CORPO DEL MESSAGGIO */}
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Messaggio del Cliente</label>
                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap flex-1 min-h-[120px]">
                  {selectedLead.message || "Il cliente non ha lasciato alcun messaggio aggiuntivo."}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-2">
              <MessageSquare size={40} className="text-slate-300" />
              <p className="text-sm font-bold">Nessun lead selezionato</p>
              <p className="text-xs max-w-xs text-slate-400">Seleziona una richiesta dalla lista di sinistra per leggerne i dettagli completi ed entrare in contatto.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
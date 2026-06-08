'use client';
import Link from "next/link";

import { useEffect, useState, use } from 'react';
import { supabase } from '@/app/supabase'; // Assicurati che l'alias o il percorso sia lo stesso funzionante della dashboard
import { Building2, Euro, Maximize, ArrowUpDown, Armchair, Gem, BedDouble, Bath, Home, Phone, Mail, MapPin } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  image_url?: string;
  sqft?: number;
  has_elevator?: boolean;
  is_furnished?: boolean;
  is_luxury?: boolean;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export default function PublicShowcase({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      setLoading(true);
      
      // 1. Recupera i dati del Tenant (Agenzia) tramite lo slug dell'URL
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!tenantData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTenant(tenantData);

      // 2. Recupera solo gli immobili associati a questa specifica agenzia
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false });

      if (propertiesData) {
        setProperties(propertiesData);
      }
      setLoading(false);
    }

    loadPublicData();
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-xl max-w-md">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-5">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Agenzia non trovata</h1>
          <p className="text-slate-500 text-sm mt-2">L'indirizzo inserito non corrisponde a nessuna agenzia immobiliare registrata nei nostri sistemi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* NAVBAR PUBBLICA: Mostra automaticamente il logo personalizzato dell'agenzia */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 sm:px-12 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-9 w-auto object-contain max-w-[160px]" />
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-bold tracking-tight text-slate-800">{tenant?.name}</span>
            </div>
          )}
        </div>
        <a 
          href="#contatti" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95"
        >
          Contatta Agenzia
        </a>
      </nav>

      {/* HERO SECTION IMMOBILIARE */}
      <header className="relative bg-slate-900 py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="relative max-w-3xl mx-auto space-y-4">
          <span className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Catalogo Esclusivo
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Trova la tua casa ideale con <span className="text-indigo-400">{tenant?.name}</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto font-medium">
            Esplora le nostre proposte immobiliari selezionate con cura per garantirti massima qualità e comfort.
          </p>
        </div>
      </header>

      {/* VETRINA DEGLI IMMOBILI DIVERSIFICATI */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-[400px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-md mx-auto p-6 shadow-sm">
            <Home className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nessun immobile disponibile</h3>
            <p className="text-slate-400 text-xs mt-1">Al momento non ci sono annunci pubblicati. Torna a trovarci presto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Link 
                href={`/${slug}/immobili/${property.id}`}
                key={property.id} 
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* COPERTINA */}
                  <div className="h-56 w-full relative overflow-hidden bg-slate-50">
                    {property.image_url ? (
                      <img src={property.image_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home className="h-10 w-10 stroke-[1.2]" />
                      </div>
                    )}
                    
                    {/* PREZZO */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-xl font-black text-base shadow-sm flex items-center gap-0.5">
                      <Euro className="h-4 w-4 text-indigo-600 stroke-[2.5]" />
                      {property.price.toLocaleString('it-IT')}
                    </div>

                    {/* BADGE LUXURY */}
                    {property.is_luxury && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        <Gem className="h-3 w-3" /> Premium
                      </div>
                    )}
                  </div>

                  {/* CORPO INFORMAZIONI */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">{property.title}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1 line-clamp-3 leading-relaxed">{property.description || "Contatta i nostri consulenti per ricevere maggiori informazioni e dettagli su questa proprietà."}</p>
                    </div>

                    {/* METRICHE PRINCIPALI */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                        <Maximize className="h-3.5 w-3.5 text-slate-400 mx-auto mb-1" />
                        <p className="text-[11px] font-bold text-slate-700">{property.sqft ? `${property.sqft} m²` : '-- m²'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 mx-auto mb-1" />
                        <p className="text-[11px] font-bold text-slate-700">{property.has_elevator ? 'Ascensore' : 'No Asc.'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                        <Armchair className="h-3.5 w-3.5 text-slate-400 mx-auto mb-1" />
                        <p className="text-[11px] font-bold text-slate-700">{property.is_furnished ? 'Arredato' : 'Vuoto'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LOCALI E BAGNI FOOTER */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-50/60 flex justify-between items-center text-slate-400 font-bold text-xs bg-slate-50/20">
                  <span className="text-indigo-600 font-semibold hover:underline">Vedi dettagli</span>
                  <div className="flex gap-2 text-slate-600">
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <BedDouble className="h-3.5 w-3.5 text-slate-400" /> {property.beds || 0} loc.
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <Bath className="h-3.5 w-3.5 text-slate-400" /> {property.baths || 0} bag.
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* SEZIONE CONTATTI DINAMICA */}
      <footer id="contatti" className="bg-white border-t border-slate-100 py-12 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Richiedi un appuntamento</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">Siamo a tua completa disposizione per visite guidate o consulenze mutuo. Contattaci tramite i nostri canali diretti.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-2 font-semibold text-sm text-slate-700">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-full sm:w-auto justify-center">
              <Phone className="h-4 w-4 text-indigo-600" /> +39 06 1234567
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-full sm:w-auto justify-center">
              <Mail className="h-4 w-4 text-indigo-600" /> info@{tenant?.slug || 'agenzia'}.it
            </div>
          </div>
          <p className="text-xs text-slate-400 pt-6">© {new Date().getFullYear()} {tenant?.name}. Tutti i diritti riservati. powered by RealEstateSaaS.</p>
        </div>
      </footer>

    </div>
  );
}
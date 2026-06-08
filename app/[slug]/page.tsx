'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../supabase'; // Aggiornato il percorso di importazione
import { Home, Euro, BedDouble, Bath, Building2, Plus, X } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export default function Dashboard({ params }: { params: Promise<{ slug: string }> }) {
  // Scartiamo i parametri dell'URL in modo sicuro per Next.js
  const { slug } = use(params);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorTenant, setErrorTenant] = useState(false);
  
  // Modale e Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carica i dati dell'agenzia e i suoi relativi immobili
  async function loadTenantData() {
    setLoading(true);
    
    // 1. Cerca il tenant (agenzia) che corrisponde allo slug nell'URL
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!tenantData) {
      setErrorTenant(true);
      setLoading(false);
      return;
    }

    setTenant(tenantData);

    // 2. Recupera SOLO gli immobili che appartengono a questa specifica agenzia (Filtro Tenant)
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', tenantData.id)
      .order('created_at', { ascending: false });
    
    if (propertiesData) setProperties(propertiesData);
    setLoading(false);
  }

  useEffect(() => {
    loadTenantData();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !title || !price) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('properties')
      .insert([
        {
          tenant_id: tenant.id, // Legato dinamicamente all'agenzia corrente!
          title,
          description,
          price: parseFloat(price),
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseInt(baths) : null,
        }
      ]);

    if (error) {
      alert(error.message);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setBeds('');
      setBaths('');
      setIsModalOpen(false);
      await loadTenantData(); // Ricarica i dati isolati
    }
    setIsSubmitting(false);
  }

  if (errorTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white border rounded-2xl shadow-sm max-w-sm">
          <Building2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Agenzia non trovata</h1>
          <p className="text-slate-500 text-sm mt-2">L'indirizzo inserito non corrisponde a nessuna agenzia registrata nel nostro sistema SaaS.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative">
      {/* NAVBAR DINAMICA */}
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-slate-800">
            RealEstate<span className="text-indigo-600">SaaS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-700">
            {loading ? 'Caricamento agenzia...' : tenant?.name}
          </span>
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase">
            {tenant?.name ? tenant.name[0] : 'A'}
          </div>
        </div>
      </nav>

      {/* CONTENUTO PRINCIPALE */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">I tuoi Immobili</h1>
            <p className="text-slate-500 mt-1">Pannello di controllo esclusivo per la tua filiale.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Nuovo Immobile
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">
            Caricamento dati in corso...
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border rounded-2xl p-8 shadow-sm">
            Nessun immobile presente per questa agenzia. Clicca su "+ Nuovo Immobile" per fare il primo inserimento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="h-48 bg-gradient-to-br from-indigo-50 to-slate-100 relative flex items-center justify-center text-indigo-400">
                    <Home className="h-12 w-12 stroke-[1.5]" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{property.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{property.description}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xl font-black text-indigo-600 flex items-center">
                      <Euro className="h-5 w-5 stroke-[2.5]" />
                      {property.price.toLocaleString('it-IT')}
                    </span>
                    <div className="flex gap-4 text-slate-500 text-sm font-semibold">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4 text-slate-400" /> {property.beds || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-slate-400" /> {property.baths || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FINSTRÀ MODALE DEL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-slate-900">Aggiungi a {tenant?.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Titolo annuncio *</label>
                <input type="text" required placeholder="Es. Attico vista parco" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-indigo-500"/>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Descrizione</label>
                <textarea rows={2} placeholder="Dettagli..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Prezzo (€) *</label>
                <input type="number" required placeholder="Es. 450000" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-indigo-500"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Stanze</label>
                  <input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bagni</label>
                  <input type="number" value={baths} onChange={(e) => setBaths(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm"/>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl">Annulla</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl disabled:opacity-50">
                  {isSubmitting ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
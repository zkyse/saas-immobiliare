'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../supabase';
import { Home, Euro, BedDouble, Bath, Building2, Plus, X, Upload, ImageIcon, Maximize, ArrowUpDown, Armchair, Gem, Sparkles } from 'lucide-react';

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
}

export default function Dashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorTenant, setErrorTenant] = useState(false);
  
  // Stati del Form Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [hasElevator, setHasElevator] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);
  const [isLuxury, setIsLuxury] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTenantData() {
    setLoading(true);
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
    let uploadedImageUrl = '';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${tenant.id}/${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('properties')
        .upload(fileName, imageFile);

      if (storageError) {
        alert("Errore caricamento immagine: " + storageError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('properties')
        .getPublicUrl(fileName);

      uploadedImageUrl = publicUrl;
    }

    const { error } = await supabase
      .from('properties')
      .insert([
        {
          tenant_id: tenant.id,
          title,
          description,
          price: parseFloat(price),
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseInt(baths) : null,
          sqft: sqft ? parseFloat(sqft) : null,
          has_elevator: hasElevator,
          is_furnished: isFurnished,
          is_luxury: isLuxury,
          image_url: uploadedImageUrl || null
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
      setSqft('');
      setHasElevator(false);
      setIsFurnished(false);
      setIsLuxury(false);
      setImageFile(null);
      setIsModalOpen(false);
      await loadTenantData();
    }
    setIsSubmitting(false);
  }

  if (errorTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 backdrop-blur-3xl">
        <div className="text-center p-10 bg-white/80 border border-slate-100 rounded-3xl shadow-xl max-w-md backdrop-blur-md">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-5">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Spazio non trovato</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">L'URL inserito non appartiene a nessuna agenzia registrata nella nostra rete SaaS.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* NAVBAR MODERNISSIMA FLOATING */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-[0_2px_20px_-5px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">
            RealEstate<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">SaaS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{tenant?.name}</p>
            <p className="text-xs font-medium text-slate-400">Workspace Agente</p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100 transform hover:scale-105 transition duration-200 uppercase">
            {tenant?.name ? tenant.name[0] : 'A'}
          </div>
        </div>
      </nav>

      {/* CONTENUTO PRINCIPALE */}
      <main className="p-8 max-w-7xl mx-auto space-y-10">
        
        {/* HERO HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 p-6 rounded-3xl border border-white/60 shadow-sm backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-1">
              <Sparkles className="h-3 w-3" /> Dashboard di Gestione
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catalogo Proprietà</h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Gestisci in totale autonomia i tuoi annunci esclusivi.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 rounded-2xl transition duration-200 shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Nuovo Immobile
          </button>
        </div>

        {/* LOADING O GRIGLIA */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-[420px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto p-8">
            <div className="h-16 w-16 bg-slate-50 text-slate-400 flex items-center justify-center rounded-2xl mx-auto mb-4">
              <Home className="h-8 w-8 stroke-[1.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nessun immobile salvato</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Comincia subito a popolare il tuo database cliccando sul tasto in alto.</p>
          </div>
        ) : (
          /* GRIGLIA PREMIUM IMMOBILI */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="group bg-white rounded-3xl border border-slate-100/80 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
                <div>
                  {/* CONTENITORE IMMAGINE COPERTINA */}
                  <div className="h-56 w-full relative overflow-hidden bg-slate-100">
                    {property.image_url ? (
                      <img 
                        src={property.image_url} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 to-slate-100 flex items-center justify-center text-indigo-300">
                        <Home className="h-12 w-12 stroke-[1.2]" />
                      </div>
                    )}
                    {/* Prezzo in Evidenza sovrapposto */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-xl font-black text-base shadow-sm flex items-center gap-0.5">
                      <Euro className="h-4 w-4 stroke-[2.5] text-indigo-600" />
                      {property.price.toLocaleString('it-IT')}
                    </div>
                    {/* Badge Lusso Sovrapposto */}
                    {property.is_luxury && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 uppercase tracking-wider">
                        <Gem className="h-3 w-3" /> Lusso
                      </div>
                    )}
                  </div>
                  
                  {/* DATI PRINCIPALI */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">{property.title}</h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed font-medium">{property.description || "Nessuna descrizione fornita per questo annuncio."}</p>
                    </div>
                    
                    {/* GRIGLIA DETTAGLI EDITATA A 3 COLONNE (Perfetta per il tuo mockup) */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <span className="flex items-center gap-1.5 bg-slate-50/80 text-slate-600 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-100/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                        <Maximize className="h-3.5 w-3.5 text-slate-400 stroke-[2.5]" /> {property.sqft ? `${property.sqft} m²` : '-- m²'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50/80 text-slate-600 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-100/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 stroke-[2.5]" /> {property.has_elevator ? 'Ascensore' : 'No Asc.'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50/80 text-slate-600 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-100/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                        <Armchair className="h-3.5 w-3.5 text-slate-400 stroke-[2.5]" /> {property.is_furnished ? 'Arredato' : 'Vuoto'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER DELLA CARD MINIMALE (Locali e Bagni dinamici) */}
                <div className="px-6 pb-6 pt-4 border-t border-slate-50 flex justify-end gap-3 text-slate-500 font-bold text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-50/60 px-3 py-1.5 rounded-xl border border-slate-100/50">
                    <BedDouble className="h-3.5 w-3.5 text-slate-400 stroke-[2.5]" /> {property.beds ? `${property.beds}+ locali` : '0 locali'}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50/60 px-3 py-1.5 rounded-xl border border-slate-100/50">
                    <Bath className="h-3.5 w-3.5 text-slate-400 stroke-[2.5]" /> {property.baths ? `${property.baths}+ bagni` : '0 bagni'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* STRUTTURA FORM MODALE RIVOLUZIONATA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* INTESTAZIONE MODALE */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Crea Annuncio</h2>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Inserisci le specifiche per il mercato pubblico.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* CORPO DEL FORM SCROLLABILE */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* CAMPO: TITOLO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Titolo Annuncio *</label>
                <input 
                  type="text" required placeholder="Es. Attico con terrazzo vista Duomo" value={title} onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* CAMPO: DESCRIZIONE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Descrizione</label>
                <textarea 
                  rows={3} placeholder="Descrivi i punti forti dell'immobile..." value={description} onChange={(e) => setDescription(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none transition"
                />
              </div>

              {/* AREA FILE UPLOAD DESIGN CURATO */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Immagine Copertina</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-5 border-2 border-slate-200 border-dashed rounded-2xl hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/10 transition relative">
                  <div className="space-y-2 text-center">
                    {imageFile ? (
                      <div className="flex flex-col items-center gap-1 text-indigo-600 text-sm font-semibold">
                        <div className="p-2 bg-indigo-50 rounded-xl mb-1">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <span className="truncate max-w-[240px] text-xs text-slate-700 font-medium">{imageFile.name}</span>
                        <button type="button" onClick={() => setImageFile(null)} className="text-xs text-red-500 mt-1 hover:underline font-bold">Rimuovi immagine</button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-7 w-7 text-slate-400 stroke-[1.5]" />
                        <div className="text-sm text-slate-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span className="hover:underline">Seleziona un file</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { if(e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }}/>
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP fino a 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGA MULTI-CAMPO: PREZZO E MQ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Prezzo (€) *</label>
                  <input 
                    type="number" required placeholder="Es. 680000" value={price} onChange={(e) => setPrice(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Superficie (m²)</label>
                  <input 
                    type="number" placeholder="Es. 95" value={sqft} onChange={(e) => setSqft(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* RIGA MULTI-CAMPO: CAMERE E BAGNI */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Camere da Letto</label>
                  <input 
                    type="number" placeholder="0" value={beds} onChange={(e) => setBeds(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Bagni totali</label>
                  <input 
                    type="number" placeholder="0" value={baths} onChange={(e) => setBaths(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* RIGHE CHECKBOX MINIMALI E MODERNE */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer group">
                  <input type="checkbox" checked={hasElevator} onChange={(e) => setHasElevator(e.target.checked)} className="rounded-lg text-indigo-600 focus:ring-indigo-500/20 h-4 w-4 border-slate-300" />
                  <span className="group-hover:text-slate-900 transition">Edificio dotato di Ascensore</span>
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer group">
                  <input type="checkbox" checked={isFurnished} onChange={(e) => setIsFurnished(e.target.checked)} className="rounded-lg text-indigo-600 focus:ring-indigo-500/20 h-4 w-4 border-slate-300" />
                  <span className="group-hover:text-slate-900 transition">Spazi interni già Arredati</span>
                </label>
                <div className="h-px bg-slate-200/60 my-1" />
                <label className="flex items-center gap-3 text-sm font-bold text-amber-700 cursor-pointer group">
                  <input type="checkbox" checked={isLuxury} onChange={(e) => setIsLuxury(e.target.checked)} className="rounded-lg text-amber-600 focus:ring-amber-500/20 h-4 w-4 border-slate-300" />
                  <span className="flex items-center gap-1.5 group-hover:text-amber-800 transition">
                    <Gem className="h-4 w-4 text-amber-500" /> Contrassegna come Annuncio di Lusso
                  </span>
                </label>
              </div>

              {/* AZIONI FOOTER */}
              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 sticky bottom-0 bg-white">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition"
                >
                  Annulla
                </button>
                <button 
                  type="submit" disabled={isSubmitting} 
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-indigo-600/10"
                >
                  {isSubmitting ? 'Salvataggio...' : 'Pubblica Annuncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
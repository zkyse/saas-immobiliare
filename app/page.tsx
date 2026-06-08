'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Home, Euro, BedDouble, Bath, Building2, Plus } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      // Recupera tutti gli immobili presenti nel database
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (data) setProperties(data);
      setLoading(false);
    }
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR */}
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-slate-800">
            RealEstate<span className="text-indigo-600">SaaS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">Agenzia Premium Milano</span>
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
        </div>
      </nav>

      {/* CONTENUTO PRINCIPALE */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">I tuoi Immobili</h1>
            <p className="text-slate-500 mt-1">Gestisci gli annunci e le proprietà della tua agenzia.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm">
            <Plus className="h-5 w-5" />
            Nuovo Immobile
          </button>
        </div>

        {/* STATO DI CARICAMENTO */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">
            Caricamento immobili in corso...
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border rounded-2xl p-8 shadow-sm">
            Nessun immobile trovato. Clicca su "Nuovo Immobile" per iniziare.
          </div>
        ) : (
          /* GRIGLIA DEGLI IMMOBILI */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                <div>
                  {/* Anteprima Immagine (Segnaposto grafico moderno) */}
                  <div className="h-48 bg-gradient-to-br from-indigo-50 to-slate-100 relative flex items-center justify-center text-indigo-400">
                    <Home className="h-12 w-12 stroke-[1.5]" />
                  </div>
                  
                  {/* Dettagli Testuali */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{property.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{property.description}</p>
                  </div>
                </div>

                {/* Prezzo e Icone Camere/Bagni */}
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
    </div>
  );
}
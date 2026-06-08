"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/supabase";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText, ArrowLeft, Plus, Loader2, Building } from "lucide-react";

interface Property {
  id: string;
  title: string;
}

interface Appointment {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  notes: string;
  properties: { title: string } | null;
}

export default function DashboardCalendario({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stati del Form
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [notes, setNotes] = useState("");

  async function loadData() {
    setLoading(true);
    
    // 1. Recupera Tenant
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenantData) return;
    setTenantId(tenantData.id);

    // 2. Recupera Immobili per il selettore del form
    const { data: propsData } = await supabase
      .from("properties")
      .select("id, title")
      .eq("tenant_id", tenantData.id);
    if (propsData) setProperties(propsData);

    // 3. Recupera Appuntamenti futuri o odierni
    const { data: appsData } = await supabase
      .from("appointments")
      .select(`
        id, title, client_name, client_email, client_phone, 
        appointment_date, appointment_time, notes,
        properties ( title )
      `)
      .eq("tenant_id", tenantData.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (appsData) setAppointments(appsData as unknown as Appointment[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !title || !clientName || !appointmentDate || !appointmentTime) return;

    setSubmitting(true);

    const { error } = await supabase.from("appointments").insert({
      tenant_id: tenantId,
      title,
      client_name: clientName,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      property_id: propertyId || null,
      notes: notes || null,
    });

    if (!error) {
      // Resetta il form
      setTitle("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setAppointmentDate("");
      setAppointmentTime("");
      setPropertyId("");
      setNotes("");
      // Ricarica la lista
      await loadData();
    }
    setSubmitting(false);
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
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href={`/${slug}/dashboard`} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agenda Appuntamenti</h1>
          <p className="text-xs text-slate-500 font-medium">Pianifica le visite ai tuoi immobili e i colloqui con i clienti</p>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM DI NUOVO APPUNTAMENTO (Prende 1 colonna) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Nuovo Appuntamento</h2>
          
          <form onSubmit={handleCreateAppointment} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Titolo/Oggetto *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Es. Visita Bilocale Centro" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Data *</label>
                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ora *</label>
                <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Cliente *</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Nome e Cognome" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Telefono</label>
                <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="333..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="mail@..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Immobile Associato</label>
              <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-indigo-600">
                <option value="">Nessuno (Appuntamento generico)</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Note / Dettagli</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Note aggiuntive..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-indigo-600" />
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
              Salva Appuntamento
            </button>
          </form>
        </div>

        {/* LISTA APPUNTAMENTI IN PROGRAMMA (Prende 2 colonne) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Prossimi Appuntamenti</h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 architecture-list">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CalendarIcon className="mx-auto text-slate-300" size={36} />
                <p className="text-sm font-medium">Nessun appuntamento programmato</p>
                <p className="text-xs text-slate-400">Usa il modulo a sinistra per fissare il tuo primo incontro.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50/60 border border-slate-200/60 rounded-xl hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-indigo-100">
                        <CalendarIcon size={12} /> {new Date(app.appointment_date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-200">
                        <Clock size={12} /> {app.appointment_time.substring(0, 5)}
                      </span>
                      {app.properties && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                          <Building size={12} /> {app.properties.title}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{app.title}</h3>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold"><User size={12} /> {app.client_name}</span>
                      {app.client_phone && <span className="flex items-center gap-1"><Phone size={12} /> {app.client_phone}</span>}
                      {app.client_email && <span className="flex items-center gap-1 break-all"><Mail size={12} /> {app.client_email}</span>}
                    </div>

                    {app.notes && (
                      <p className="text-xs bg-white border border-slate-100 p-2 rounded-lg text-slate-600 italic mt-1 flex items-start gap-1">
                        <FileText size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        {app.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
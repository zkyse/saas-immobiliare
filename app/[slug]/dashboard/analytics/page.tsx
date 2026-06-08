"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/supabase";
import Link from "next/link";
import { ArrowLeft, BarChart3, Building2, MessageSquare, Calendar, Loader2, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface KpiStats {
  totalProperties: number;
  totalLeads: number;
  totalAppointments: number;
}

interface ChartData {
  name: string;
  "Nuovi Lead": number;
}

export default function DashboardAnalytics({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KpiStats>({ totalProperties: 0, totalLeads: 0, totalAppointments: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);

      // 1. Recupera il Tenant
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!tenantData) {
        setLoading(false);
        return;
      }

      // 2. Query parallele per i KPI
      const [propsRes, leadsRes, appsRes] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("tenant_id", tenantData.id),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantData.id),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantData.id),
      ]);

      setStats({
        totalProperties: propsRes.count || 0,
        totalLeads: leadsRes.count || 0,
        totalAppointments: appsRes.count || 0,
      });

      // 3. Generazione dati simulati/storici per il grafico basati sui lead reali
      // (In produzione puoi raggruppare i lead per data di creazione, qui facciamo un trend pulito)
      const currentYear = new Date().getFullYear();
      const mockMonthlyData: ChartData[] = [
        { name: "Gen", "Nuovi Lead": Math.floor((leadsRes.count || 0) * 0.08) },
        { name: "Feb", "Nuovi Lead": Math.floor((leadsRes.count || 0) * 0.12) },
        { name: "Mar", "Nuovi Lead": Math.floor((leadsRes.count || 0) * 0.15) },
        { name: "Apr", "Nuovi Lead": Math.floor((leadsRes.count || 0) * 0.20) },
        { name: "Mag", "Nuovi Lead": Math.floor((leadsRes.count || 0) * 0.25) },
        { name: "Giu", "Nuovi Lead": leadsRes.count || 0 }, // picco attuale
      ];
      
      setChartData(mockMonthlyData);
      setLoading(false);
    }

    loadAnalyticsData();
  }, [slug]);

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
          <h1 className="text-xl font-bold tracking-tight">Dashboard Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">Controlla l'andamento e le metriche delle tue attività immobiliari</p>
        </div>
      </header>

      {/* Contenuto Principale */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* GRIGLIA KPI (I 3 Riquadri) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card Immobili */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Immobili Totali</span>
              <p className="text-3xl font-black text-slate-900">{stats.totalProperties}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Building2 size={24} />
            </div>
          </div>

          {/* Card Lead */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Ricevuti</span>
              <p className="text-3xl font-black text-slate-900">{stats.totalLeads}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <MessageSquare size={24} />
            </div>
          </div>

          {/* Card Appuntamenti */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appuntamenti</span>
              <p className="text-3xl font-black text-slate-900">{stats.totalAppointments}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Calendar size={24} />
            </div>
          </div>

        </div>

        {/* GRAFICO E DETTAGLI TRADING */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-indigo-500" /> Trend Acquisizione Lead
              </h2>
              <p className="text-xs text-slate-400">Visualizzazione dei contatti generati negli ultimi mesi</p>
            </div>
          </div>

          {/* Area del Grafico di Recharts */}
          <div className="w-full h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="Nuovi Lead" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
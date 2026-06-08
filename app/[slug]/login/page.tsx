'use client';

import { useState, use } from 'react';
import { supabase } from '@/app/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message === 'Invalid login credentials' 
        ? 'Credenziali non valide. Riprova.' 
        : error.message
      );
      setLoading(false);
    } else {
      // Login riuscito, reindirizza alla dashboard dell'agenzia
      router.push(`/${slug}/dashboard`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto w-full max-w-md text-center space-y-4">
        <div className="inline-flex bg-gradient-to-tr from-indigo-600 to-violet-500 p-3 rounded-2xl text-white shadow-md shadow-indigo-100 mx-auto">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Accedi al tuo Workspace
        </h2>
        <p className="text-sm font-medium text-slate-500">
          Gestisci gli annunci per l'area <span className="text-indigo-600 font-bold">/{slug}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-xl text-xs font-bold animate-in fade-in duration-200">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Indirizzo Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="agente@esempio.it"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
              >
                {loading ? 'Verifica in corso...' : 'Entra nel pannello'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
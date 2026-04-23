import { useState } from 'react';
import { Mail, Lock, User as UserIcon, Loader2, AlertTriangle, ArrowRight, ShoppingBasket, Receipt, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoKaddy from '../assets/Logo_Kaddy.png';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message);
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password });
      if (err) {
        setError(err.message);
      } else if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          username: username.trim() || email.split('@')[0],
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-transparent to-emerald-950/10" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative max-w-md mx-auto px-5 pt-10 pb-10">
        <div className="flex flex-col items-center text-center">
          <img
            src={logoKaddy}
            alt="Kaddy"
            className="w-28 h-28 rounded-3xl shadow-2xl shadow-emerald-500/20 ring-1 ring-slate-800"
          />
          <h1 className="mt-5 text-3xl font-bold text-emerald-400 tracking-tight">Kaddy</h1>
          <p className="mt-2 text-slate-300 text-[15px] leading-relaxed max-w-sm">
            Ta liste de courses intelligente. Scanne tes tickets, compare les prix, suis tes dépenses.
          </p>
        </div>

        <ul className="mt-6 grid grid-cols-3 gap-2">
          {[
            { icon: ShoppingBasket, label: 'Listes' },
            { icon: Receipt, label: 'Tickets' },
            { icon: BarChart3, label: 'Stats' },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex flex-col items-center gap-1.5">
              <Icon className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-slate-300">{label}</span>
            </li>
          ))}
        </ul>

        <form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur p-5 space-y-3">
          <div className="flex rounded-full bg-slate-950 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition ${
                mode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition ${
                mode === 'signup' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          {mode === 'signup' && (
            <label className="block">
              <span className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">Nom d'utilisateur</span>
              <div className="mt-1.5 relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Sam & Maman"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">Email</span>
            <div className="mt-1.5 relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
                required
                autoComplete="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">Mot de passe</span>
            <div className="mt-1.5 relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 transition text-slate-950 font-semibold py-3 rounded-full shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-slate-500 leading-relaxed">
          En continuant, tu acceptes de conserver tes données de courses liées à ton compte, à vie, de manière privée.
        </p>
      </div>
    </div>
  );
}

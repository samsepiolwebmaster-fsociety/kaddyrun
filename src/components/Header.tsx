import { Star, Home, ChevronDown, LogOut } from 'lucide-react';
import { STORES } from '../types';
import logoKaddy from '../assets/Logo_Kaddy.png';

interface Props {
  store: string;
  onStoreChange: (s: string) => void;
  username: string;
  onSignOut: () => void;
}

export function Header({ store, onStoreChange, username, onSignOut }: Props) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-6 pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <img src={logoKaddy} alt="Kaddy" className="w-7 h-7 rounded-md shrink-0" />
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">Kaddy</h1>
          <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 min-w-0">
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{username || 'Mon compte'}</span>
          <span className="text-slate-600">•</span>
          <span className="truncate">{store}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <select
            value={store}
            onChange={(e) => onStoreChange(e.target.value)}
            className="appearance-none bg-slate-900/80 border border-slate-700 rounded-lg pl-4 pr-9 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          onClick={onSignOut}
          aria-label="Déconnexion"
          title="Déconnexion"
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

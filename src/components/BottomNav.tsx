import { ShoppingCart, Camera, Archive, BarChart3 } from 'lucide-react';
import type { Tab } from '../types';

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

const items: { key: Tab; label: string; Icon: typeof ShoppingCart }[] = [
  { key: 'list', label: 'LISTE', Icon: ShoppingCart },
  { key: 'scanner', label: 'SCANNER', Icon: Camera },
  { key: 'compare', label: 'COMPARER', Icon: Archive },
  { key: 'stats', label: 'STATS', Icon: BarChart3 },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur border-t border-slate-800/80 z-20">
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {items.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`px-5 py-1.5 rounded-lg transition-all ${isActive ? 'bg-emerald-500/10 ring-1 ring-emerald-500/40' : ''}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span className="text-[10px] font-semibold tracking-wider">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useMemo } from 'react';
import { Archive, Sparkles } from 'lucide-react';
import { STORES, type Item } from '../types';

interface Props {
  items: Item[];
  currentStore: string;
}

const MULTIPLIERS: Record<string, number> = {
  'E.Leclerc': 1,
  'Run Market': 1.04,
  Jumbo: 1.02,
  'Leader Price': 0.97,
  Score: 1.06,
  'Marché': 1.1,
};

export function CompareView({ items, currentStore }: Props) {
  const baseItems = useMemo(
    () => items.filter((i) => i.store === currentStore && i.to_buy),
    [items, currentStore]
  );
  const baseTotal = useMemo(
    () => baseItems.reduce((s, i) => s + Number(i.price), 0),
    [baseItems]
  );

  const rows = STORES.map((s) => ({
    store: s,
    total: baseTotal * (MULTIPLIERS[s] ?? 1),
    count: baseItems.length,
  }));

  const min = Math.min(...rows.map((r) => r.total));

  return (
    <div className="px-5 pb-28">
      <h2 className="text-xl font-bold text-white">Comparer les magasins</h2>
      <p className="text-sm text-slate-400 mt-1">Où faire tes courses pour ta liste actuelle ?</p>

      <ul className="mt-6 space-y-3">
        {rows.map(({ store, total, count }) => {
          const best = total === min && count > 0;
          return (
            <li
              key={store}
              className={`flex items-center gap-4 rounded-2xl p-4 border transition ${
                best
                  ? 'bg-emerald-500/5 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className={`shrink-0 rounded-xl p-3 ${best ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white">{store}</div>
                {best && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mt-0.5">
                    <Sparkles className="w-3 h-3" />
                    Meilleur prix
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white tabular-nums">{total.toFixed(2)}€</div>
                <div className="text-xs text-slate-400 mt-0.5">{count} prix estimés</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

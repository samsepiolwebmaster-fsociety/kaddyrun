import { useMemo, useState } from 'react';
import { ClipboardList, ShoppingCart, Plus, Star, Check, Trash2, Info } from 'lucide-react';
import type { Item, ListType } from '../types';

interface Props {
  store: string;
  items: Item[];
  mode: ListType;
  onModeChange: (m: ListType) => void;
  onAdd: (name: string) => Promise<void>;
  onToggleToBuy: (item: Item) => Promise<void>;
  onToggleCart: (item: Item) => Promise<void>;
  onToggleFav: (item: Item) => Promise<void>;
  onDelete: (item: Item) => Promise<void>;
  onStart: () => void;
}

type Filter = 'all' | 'tobuy' | 'pantry' | 'fav';

export function ListView({
  store,
  items,
  mode,
  onModeChange,
  onAdd,
  onToggleToBuy,
  onToggleCart,
  onToggleFav,
  onDelete,
  onStart,
}: Props) {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const pantryItems = useMemo(() => items.filter((i) => i.store === store), [items, store]);

  const toBuy = pantryItems.filter((i) => i.to_buy);
  const estimated = toBuy.reduce((s, i) => s + Number(i.price), 0);

  const filtered = useMemo(() => {
    if (filter === 'tobuy') return pantryItems.filter((i) => i.to_buy);
    if (filter === 'pantry') return pantryItems.filter((i) => !i.to_buy);
    if (filter === 'fav') return pantryItems.filter((i) => i.is_favorite);
    const buyList = pantryItems.filter((i) => i.to_buy);
    const rest = pantryItems.filter((i) => !i.to_buy);
    return [...buyList, ...rest];
  }, [pantryItems, filter]);

  const storeItems = pantryItems.filter((i) => i.to_buy);
  const cartTotal = storeItems.filter((i) => i.in_cart).reduce((s, i) => s + Number(i.price), 0);
  const checked = storeItems.filter((i) => i.in_cart).length;
  const progress = storeItems.length ? (checked / storeItems.length) * 100 : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    await onAdd(name);
    setInput('');
  };

  const isPrep = mode === 'prepare';
  const accent = isPrep ? 'amber' : 'emerald';

  return (
    <div className="px-5 space-y-5 pb-28">
      <div className="bg-slate-900/70 rounded-xl p-1 grid grid-cols-2 gap-1 border border-slate-800">
        <button
          onClick={() => onModeChange('prepare')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
            isPrep
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Préparer
        </button>
        <button
          onClick={() => onModeChange('store')}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
            !isPrep
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Au magasin
        </button>
      </div>

      {isPrep ? (
        <div className="rounded-2xl p-5 border border-amber-900/40 bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-900/60 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[11px] font-bold tracking-[0.18em] text-amber-400 uppercase">
              Liste en préparation
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tabular-nums">{toBuy.length}</span>
              <span className="text-base text-slate-300">article{toBuy.length > 1 ? 's' : ''}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">~{estimated.toFixed(2)}€ estimé</div>
          </div>
          <button
            onClick={() => {
              onModeChange('store');
              onStart();
            }}
            disabled={toBuy.length === 0}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition text-slate-950 font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-emerald-500/20"
          >
            <ShoppingCart className="w-4 h-4" />
            C'est parti
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5 border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/60">
          <div className="text-[11px] font-bold tracking-[0.18em] text-emerald-400 uppercase">
            Caddie en cours
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white tabular-nums">{cartTotal.toFixed(2)}</span>
            <span className="text-xl text-emerald-400 font-semibold">€</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {checked}/{storeItems.length} articles pris
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isPrep ? 'Ajouter un article à ta liste...' : 'Ajouter un article pris au magasin...'}
          className={`flex-1 bg-slate-900/70 border border-slate-800 focus:border-${accent}-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition`}
        />
        <button
          type="submit"
          className={`${
            isPrep ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
          } active:scale-95 transition text-slate-950 rounded-xl p-3.5 shadow-lg`}
          aria-label="Ajouter"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </form>

      {isPrep ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { k: 'all', label: 'Tout' },
              { k: 'tobuy', label: 'À acheter' },
              { k: 'pantry', label: 'Garde-manger' },
              { k: 'fav', label: '★ Favoris' },
            ] as { k: Filter; label: string }[]
          ).map(({ k, label }) => {
            const active = filter === k;
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                  active
                    ? 'bg-amber-500/10 border-amber-500/60 text-amber-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl p-3.5 bg-slate-900/60 border border-slate-800">
          <div className="rounded-lg bg-emerald-500/10 text-emerald-400 p-1.5 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Coche chaque article <strong className="text-white">au moment où tu le mets dans le caddie</strong>. Le panier se met à jour en temps réel.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {isPrep && filtered.length === 0 && (
          <li className="text-center py-10 text-slate-500 text-sm">Aucun article dans cette catégorie</li>
        )}
        {!isPrep && storeItems.length === 0 && (
          <li className="text-center py-10 text-slate-500 text-sm">
            Coche des articles dans "Préparer" puis reviens ici
          </li>
        )}
        {(isPrep ? filtered : storeItems).map((item) => {
          const checkedState = isPrep ? item.to_buy : item.in_cart;
          const boxClass = isPrep
            ? checkedState
              ? 'bg-amber-500 border-amber-500 text-slate-950'
              : 'border-slate-600 hover:border-amber-500'
            : checkedState
            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
            : 'border-slate-600 hover:border-emerald-500';
          const rowBg = isPrep && checkedState
            ? 'bg-amber-500/5 border-amber-500/40'
            : !isPrep && checkedState
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700';
          return (
            <li
              key={item.id}
              className={`group flex items-center gap-3 rounded-xl p-3.5 border transition ${rowBg}`}
            >
              <button
                onClick={() => (isPrep ? onToggleToBuy(item) : onToggleCart(item))}
                className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${boxClass}`}
                aria-label="Cocher"
              >
                {checkedState && <Check className="w-4 h-4" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center gap-1.5 font-semibold text-[15px] ${
                    !isPrep && checkedState ? 'line-through text-slate-500' : 'text-white'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  {item.is_favorite && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">
                  ~{Number(item.price).toFixed(2)}€
                </div>
              </div>
              <button
                onClick={() => onToggleFav(item)}
                className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-amber-400 p-1.5"
                aria-label="Favori"
              >
                <Star
                  className={`w-4 h-4 ${item.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`}
                />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-red-400 p-1.5"
                aria-label="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

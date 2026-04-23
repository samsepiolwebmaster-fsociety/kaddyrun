import { useMemo, useState } from 'react';
import { BarChart3, Archive, Star, Receipt as ReceiptIcon, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { Receipt, ReceiptItem } from '../types';

interface Props {
  receipts: Receipt[];
  lastReceiptItems: ReceiptItem[];
  allReceiptItems: ReceiptItem[];
  username: string;
}

function csvEscape(v: string | number): string {
  const s = String(v ?? '');
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const content = rows.map((r) => r.map(csvEscape).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function StatsView({ receipts, lastReceiptItems, allReceiptItems, username }: Props) {
  const last = receipts[0];
  const [showLines, setShowLines] = useState(false);

  const monthly = useMemo(() => {
    const months = ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'];
    const base = [148, 172, 158, 162, 152, last ? Number(last.total) : 161.96];
    return months.map((m, i) => ({ m, v: base[i] }));
  }, [last]);

  const topItems = useMemo(() => {
    const receiptDates = new Map(receipts.map((r) => [r.id, new Date(r.purchased_at).getTime()]));
    const now = Date.now();
    const byName = new Map<string, { name: string; count: number; oldest: number }>();
    allReceiptItems.forEach((line) => {
      const k = line.name.toLowerCase();
      const t = receiptDates.get(line.receipt_id) ?? now;
      const prev = byName.get(k);
      byName.set(k, {
        name: prev?.name ?? line.name,
        count: (prev?.count ?? 0) + 1,
        oldest: Math.min(prev?.oldest ?? t, t),
      });
    });
    return Array.from(byName.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((t) => {
        if (t.count < 2) return { ...t, label: '1er achat' as const };
        const spanDays = Math.max(1, (now - t.oldest) / (1000 * 60 * 60 * 24));
        const every = Math.max(1, Math.round(spanDays / t.count));
        return { ...t, label: `tous les ${every} j` as const };
      });
  }, [receipts, allReceiptItems]);

  const max = Math.max(...monthly.map((d) => d.v));
  const min = Math.min(...monthly.map((d) => d.v));
  const pad = 8;
  const w = 560;
  const h = 180;
  const stepX = (w - pad * 2) / (monthly.length - 1);
  const scaleY = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = monthly.map((d, i) => ({ x: pad + i * stepX, y: scaleY(d.v) }));
  const path = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');
  const area = `${path} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;
  const gridValues = [Math.round(min), Math.round((min + max) / 2), Math.round(max)];

  const lastDate = last
    ? new Date(last.purchased_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    : '23/04';

  const exportCsv = () => {
    const receiptById = new Map(receipts.map((r) => [r.id, r]));
    const header = [
      'date_achat',
      'magasin',
      'adresse',
      'ticket',
      'total_ticket',
      'article',
      'quantite',
      'unite',
      'prix_unitaire',
      'prix_total',
      'tva',
    ];
    const rows: (string | number)[][] = [header];
    allReceiptItems.forEach((l) => {
      const r = receiptById.get(l.receipt_id);
      rows.push([
        r ? new Date(r.purchased_at).toISOString().slice(0, 10) : '',
        r?.store ?? '',
        r?.store_address ?? '',
        r?.ticket_number ?? '',
        r ? Number(r.total).toFixed(2) : '',
        l.name,
        Number(l.quantity),
        l.unit,
        Number(l.unit_price).toFixed(2),
        Number(l.total_price).toFixed(2),
        l.tva_code ?? '',
      ]);
    });
    const slug = (username || 'kaddy').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kaddy';
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`kaddy-${slug}-${date}.csv`, rows);
  };

  return (
    <div className="px-5 pb-28 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Tes statistiques</h2>
        <button
          onClick={exportCsv}
          disabled={allReceiptItems.length === 0}
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition text-slate-950 text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg shadow-emerald-500/20"
        >
          <Download className="w-3.5 h-3.5" />
          Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
          <div className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">Dernier panier</div>
          <div className="mt-2 text-3xl font-bold text-white tabular-nums">
            {last ? Number(last.total).toFixed(2) : '161.96'}<span className="text-emerald-400">€</span>
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">
            {last ? `${last.store} • ${lastDate}` : 'E.Leclerc • 23/04'}
          </div>
        </div>
        <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
          <div className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">Articles scannés</div>
          <div className="mt-2 text-3xl font-bold text-white tabular-nums">{last?.items_count ?? 42}</div>
          <div className="mt-1 text-xs text-slate-400">Dernière session</div>
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Évolution mensuelle
        </div>
        <div className="mt-4 relative">
          <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {gridValues.map((v, i) => {
              const y = scaleY(v);
              return (
                <g key={i}>
                  <line x1={pad + 28} x2={w - pad} y1={y} y2={y} stroke="#1e293b" strokeDasharray="2 4" />
                  <text x={0} y={y + 4} fill="#64748b" fontSize="10">{v}</text>
                </g>
              );
            })}
            <path d={area} fill="url(#grad)" />
            <path d={path} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === 0 || i === pts.length - 1 ? 4 : 2.5} fill="#10b981" />
            ))}
            {monthly.map((d, i) => (
              <text key={d.m} x={pad + i * stepX} y={h + 14} textAnchor="middle" fill="#64748b" fontSize="10">{d.m}</text>
            ))}
          </svg>
        </div>
      </div>

      {last && lastReceiptItems.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <button
            onClick={() => setShowLines((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ReceiptIcon className="w-4 h-4 text-emerald-400" />
              Détail du ticket du {lastDate}
            </div>
            {showLines ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {showLines && (
            <>
              <div className="px-4 pb-2 text-xs text-slate-400">
                {last.store_address || last.store}
              </div>
              <ul className="divide-y divide-slate-800 border-t border-slate-800">
                {lastReceiptItems.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm text-slate-100 truncate">{line.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {line.unit === 'kg'
                          ? `${Number(line.quantity).toFixed(3)} kg × ${Number(line.unit_price).toFixed(2)}€/kg`
                          : `${line.quantity} × ${Number(line.unit_price).toFixed(2)}€`}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white tabular-nums">
                      {Number(line.total_price).toFixed(2)}€
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-t border-slate-800">
                <span className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase">Total</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {Number(last.total).toFixed(2)}€
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Archive className="w-4 h-4 text-emerald-400" />
          Top articles (par fréquence)
        </div>
        {topItems.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">Aucun article pour le moment</div>
        ) : (
          <ul className="mt-3 space-y-2">
            {topItems.map((t, i) => (
              <li key={i} className="flex items-center justify-between text-sm py-1.5">
                <span className="flex items-center gap-2 text-slate-100 min-w-0">
                  <span className="text-slate-500 tabular-nums w-4 shrink-0">{i + 1}.</span>
                  <span className="truncate">{t.name}</span>
                  {t.count > 1 && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                </span>
                <span className="text-slate-400 text-xs shrink-0">{t.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

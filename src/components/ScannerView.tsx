import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Loader2, Receipt as ReceiptIcon, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Receipt } from '../types';

interface Props {
  store: string;
  userId: string;
}

interface ReceiptWithUrl extends Receipt {
  image_url: string | null;
}

async function signedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export function ScannerView({ store, userId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<ReceiptWithUrl[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });
    const raw = (data as Receipt[]) ?? [];
    const list = await Promise.all(
      raw.map(async (r) => ({ ...r, image_url: await signedUrl(r.image_path) }))
    );
    setReceipts(list);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Fichier non supporté. Choisis une image.');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('receipts')
      .upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const pending = receipts.find((r) => r.store === store && !r.image_path);
    if (pending) {
      await supabase.from('receipts').update({ image_path: path }).eq('id', pending.id);
    } else {
      await supabase.from('receipts').insert({
        user_id: userId,
        store,
        store_address: '',
        ticket_number: '',
        cashier: '',
        total: 0,
        items_count: 0,
        purchased_at: new Date().toISOString(),
        image_path: path,
      });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    await load();
  };

  const remove = async (r: ReceiptWithUrl) => {
    if (r.image_path) {
      await supabase.storage.from('receipts').remove([r.image_path]);
    }
    await supabase.from('receipts').delete().eq('id', r.id);
    setConfirmDelete(null);
    await load();
  };

  const count = receipts.length;
  const withImage = receipts.filter((r) => r.image_url).length;

  return (
    <div className="px-5 pb-28 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Mes tickets</h2>
        <p className="text-sm text-slate-400 mt-1">
          Uploade tes tickets de caisse et garde une trace de ton historique.
        </p>
      </div>

      <label
        htmlFor="ticket-upload"
        className={`block rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
          uploading
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-slate-700 bg-slate-900/40 hover:border-emerald-500/60 hover:bg-emerald-500/5'
        }`}
      >
        <input
          ref={fileRef}
          id="ticket-upload"
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <div className="mx-auto rounded-2xl bg-slate-900 border border-slate-800 w-16 h-16 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
          ) : (
            <Upload className="w-7 h-7 text-emerald-400" strokeWidth={1.8} />
          )}
        </div>
        <div className="mt-4 text-base font-semibold text-white">
          {uploading ? 'Envoi en cours...' : 'Ajouter un ticket'}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {uploading ? 'Ne ferme pas l\'application' : `Photo ou image — ${store}`}
        </div>
      </label>

      {error && (
        <div className="flex items-start gap-3 rounded-xl p-3.5 bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Historique
        </div>
        <div className="text-xs text-slate-500">
          {count} ticket{count > 1 ? 's' : ''} · {withImage} avec photo
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <ReceiptIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="mt-3 text-sm text-slate-400">Pas encore de ticket enregistré</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {receipts.map((r) => {
            const date = new Date(r.purchased_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const isConfirm = confirmDelete === r.id;
            return (
              <li
                key={r.id}
                className="group relative rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="aspect-[3/4] bg-slate-950 relative">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={`Ticket ${r.store}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[11px] mt-2">Sans photo</span>
                    </div>
                  )}
                  <button
                    onClick={() => setConfirmDelete(isConfirm ? null : r.id)}
                    className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur hover:bg-red-500/90 text-slate-200 hover:text-white rounded-full p-1.5 transition"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isConfirm && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 p-3">
                      <div className="text-xs text-white text-center font-medium">
                        Supprimer ce ticket ?
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => remove(r)}
                          className="text-xs px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-400 text-white font-semibold"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[13px] font-semibold text-white truncate">{r.store || 'Ticket'}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-slate-400">{date}</span>
                    {Number(r.total) > 0 && (
                      <span className="text-[12px] font-semibold text-emerald-400 tabular-nums">
                        {Number(r.total).toFixed(2)}€
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ListView } from './components/ListView';
import { ScannerView } from './components/ScannerView';
import { CompareView } from './components/CompareView';
import { StatsView } from './components/StatsView';
import { AuthPage } from './components/AuthPage';
import { supabase } from './lib/supabase';
import type { Item, ListType, Receipt, ReceiptItem, Tab } from './types';

function estimatePrice(): number {
  return Number((2 + Math.random() * 6).toFixed(2));
}

function AuthedApp({ session }: { session: Session }) {
  const userId = session.user.id;
  const [username, setUsername] = useState<string>('');
  const [store, setStore] = useState<string>('E.Leclerc');
  const [tab, setTab] = useState<Tab>('list');
  const [mode, setMode] = useState<ListType>('prepare');
  const [items, setItems] = useState<Item[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [lastReceiptItems, setLastReceiptItems] = useState<ReceiptItem[]>([]);
  const [allReceiptItems, setAllReceiptItems] = useState<ReceiptItem[]>([]);

  const loadAll = useCallback(async () => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle();
    setUsername((prof?.username as string) || session.user.email?.split('@')[0] || '');

    const { data: its } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    setItems((its as Item[]) ?? []);

    const { data: rcs } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });
    const list = (rcs as Receipt[]) ?? [];
    setReceipts(list);
    if (list.length > 0) {
      const { data: lines } = await supabase
        .from('receipt_items')
        .select('*')
        .in('receipt_id', list.map((r) => r.id))
        .order('position', { ascending: true });
      const all = (lines as ReceiptItem[]) ?? [];
      setAllReceiptItems(all);
      setLastReceiptItems(all.filter((l) => l.receipt_id === list[0].id));
    } else {
      setLastReceiptItems([]);
      setAllReceiptItems([]);
    }
  }, [userId, session.user.email]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const addItem = async (name: string) => {
    const price = estimatePrice();
    const optimistic: Item = {
      id: crypto.randomUUID(),
      device_id: '',
      name,
      price,
      is_favorite: false,
      to_buy: true,
      in_cart: mode === 'store',
      list_type: mode,
      store,
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, optimistic]);
    const { data } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        name,
        price,
        to_buy: true,
        in_cart: mode === 'store',
        list_type: mode,
        store,
      })
      .select()
      .maybeSingle();
    if (data) {
      setItems((prev) => prev.map((i) => (i.id === optimistic.id ? (data as Item) : i)));
    }
  };

  const toggleToBuy = async (item: Item) => {
    const next = !item.to_buy;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, to_buy: next, in_cart: next ? i.in_cart : false } : i))
    );
    await supabase.from('items').update({ to_buy: next, in_cart: next ? item.in_cart : false }).eq('id', item.id);
  };

  const toggleCart = async (item: Item) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, in_cart: !i.in_cart } : i)));
    await supabase.from('items').update({ in_cart: !item.in_cart }).eq('id', item.id);
  };

  const toggleFav = async (item: Item) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i)));
    await supabase.from('items').update({ is_favorite: !item.is_favorite }).eq('id', item.id);
  };

  const deleteItem = async (item: Item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await supabase.from('items').delete().eq('id', item.id);
  };

  const startShopping = () => {
    setItems((prev) => prev.map((i) => (i.to_buy ? { ...i, in_cart: false } : i)));
    supabase
      .from('items')
      .update({ in_cart: false })
      .eq('user_id', userId)
      .eq('to_buy', true);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('signOut error', e);
    }
    try {
      window.localStorage.removeItem('kaddy-auth');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="relative max-w-3xl mx-auto">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/10" />
        <div className="relative">
          <Header
            store={store}
            onStoreChange={setStore}
            username={username}
            onSignOut={signOut}
          />
          {tab === 'list' && (
            <ListView
              store={store}
              items={items}
              mode={mode}
              onModeChange={setMode}
              onAdd={addItem}
              onToggleToBuy={toggleToBuy}
              onToggleCart={toggleCart}
              onToggleFav={toggleFav}
              onDelete={deleteItem}
              onStart={startShopping}
            />
          )}
          {tab === 'scanner' && <ScannerView store={store} userId={userId} />}
          {tab === 'compare' && <CompareView items={items} currentStore={store} />}
          {tab === 'stats' && (
            <StatsView
              receipts={receipts}
              lastReceiptItems={lastReceiptItems}
              allReceiptItems={allReceiptItems}
              username={username}
            />
          )}
        </div>
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthPage />;
  return <AuthedApp session={session} />;
}

export default App;

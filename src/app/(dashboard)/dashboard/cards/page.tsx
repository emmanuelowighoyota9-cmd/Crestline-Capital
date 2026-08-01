'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon } from '@/components/Icons';

interface Card { id: string; cardType: string; cardBrand: string; lastFour: string; expiryMonth: string; expiryYear: string; status: string; dailyLimit: number; }

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchCards(); }, []);
  function fetchCards() { fetch('/api/cards').then(r => r.json()).then(d => { setCards(d.cards || []); setLoading(false); }); }

  async function toggleCard(cardId: string, currentStatus: string) { setActionLoading(cardId); const action = currentStatus === 'active' ? 'freeze' : 'unfreeze';
    try { const res = await fetch(`/api/cards/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId }) }); if (res.ok) fetchCards(); } finally { setActionLoading(null); }
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-32 rounded bg-slate-800" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-56 rounded-2xl bg-slate-900/50" /></div></div>;

  return (<div className="space-y-8"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-white">Cards</h1><span className="text-sm text-slate-400">{cards.length} card{cards.length !== 1 ? 's' : ''}</span></div>
    <div className="grid gap-6 sm:grid-cols-2">{cards.map(card => (<div key={card.id} className="rounded-2xl border border-white/5 bg-slate-900/50 overflow-hidden">
      <div className={`p-6 ${card.cardBrand === 'visa' ? 'bg-gradient-to-br from-crestline-700 to-crestline-900' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}><div className="flex justify-between items-start"><span className="text-xs font-semibold uppercase tracking-wider text-white/60">{card.cardType === 'virtual' ? 'Virtual' : 'Physical'} {card.cardBrand}</span><CreditCardIcon className="h-6 w-6 text-white/60" /></div><p className="mt-8 text-2xl font-mono tracking-wider text-white">.... .... .... {card.lastFour}</p><div className="mt-6 flex justify-between items-end"><div><p className="text-[10px] uppercase tracking-wider text-white/40">Expires</p><p className="text-sm text-white">{card.expiryMonth}/{card.expiryYear}</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-white/40">Daily Limit</p><p className="text-sm text-white">${card.dailyLimit?.toLocaleString()}</p></div></div></div>
      <div className="p-4 flex items-center justify-between"><span className={`text-xs px-2 py-0.5 rounded-full ${card.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : card.status === 'frozen' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{card.status.toUpperCase()}</span><button onClick={() => toggleCard(card.id, card.status)} disabled={actionLoading === card.id || card.status === 'cancelled'} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${card.status === 'active' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'} disabled:opacity-50`}>{actionLoading === card.id ? '...' : card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}</button></div>
    </div>))}{cards.length === 0 && <div className="col-span-full text-center py-12 text-slate-500"><CreditCardIcon className="h-12 w-12 mx-auto mb-3 text-slate-700" /><p>No cards yet. Contact support to request a card.</p></div>}</div>
  </div>);
}

'use client';

import { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, CogIcon } from '@/components/Icons';

interface Portfolio { id: string; name: string; totalInvested: number; currentValue: number; returns: number; assetAllocation: Record<string, number>; autoDeposit: boolean; autoDepositAmt: number; }

export default function InvestmentsPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/investments').then(r => r.json()).then(d => { setPortfolios(d.portfolios || []); setLoading(false); }); }, []);

  const totalInvested = portfolios.reduce((s, p) => s + p.totalInvested, 0);
  const totalCurrent = portfolios.reduce((s, p) => s + p.currentValue, 0);
  const totalReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100) : 0;

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-40 rounded bg-slate-800" /><div className="h-64 rounded-2xl bg-slate-900/50" /></div>;

  return (<div className="space-y-8"><h1 className="text-2xl font-bold text-white">Investments</h1>
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><p className="text-sm text-slate-400">Total Invested</p><p className="mt-2 text-2xl font-bold text-white">${totalInvested.toLocaleString()}</p></div><div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><p className="text-sm text-slate-400">Current Value</p><p className="mt-2 text-2xl font-bold text-white">${totalCurrent.toLocaleString()}</p></div><div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><p className="text-sm text-slate-400">Total Return</p><p className={`mt-2 text-2xl font-bold ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%</p></div></div>
    <div className="grid gap-6 lg:grid-cols-2">{portfolios.map(p => { const pReturn = (p.currentValue - p.totalInvested) / p.totalInvested * 100; const allocation = typeof p.assetAllocation === 'string' ? JSON.parse(p.assetAllocation) : p.assetAllocation;
      return (<div key={p.id} className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-white">{p.name}</h3><span className={`text-sm font-medium ${pReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pReturn >= 0 ? '+' : ''}{pReturn.toFixed(1)}%</span></div><div className="grid grid-cols-2 gap-4 mb-6"><div><p className="text-xs text-slate-500">Invested</p><p className="text-sm font-medium text-white">${p.totalInvested.toLocaleString()}</p></div><div><p className="text-xs text-slate-500">Current</p><p className="text-sm font-medium text-white">${p.currentValue.toLocaleString()}</p></div></div><div><p className="text-xs text-slate-500 mb-3">Asset Allocation</p><div className="space-y-2">{allocation && (Object.entries(allocation) as [string, number][]).map(([asset, pct]) => (<div key={asset} className="flex items-center gap-3"><span className="text-xs text-slate-400 w-12 capitalize">{asset}</span><div className="flex-1 h-2 rounded-full bg-slate-800"><div className={`h-full rounded-full ${asset === 'stocks' ? 'bg-crestline-500' : asset === 'bonds' ? 'bg-emerald-500' : asset === 'crypto' ? 'bg-amber-500' : 'bg-slate-500'}`} style={{ width: `${pct}%` }} /></div><span className="text-xs text-white w-8 text-right">{pct}%</span></div>))}</div></div>{p.autoDeposit && <div className="mt-4 flex items-center gap-2 rounded-lg bg-crestline-500/5 border border-crestline-500/10 px-3 py-2"><CogIcon className="h-4 w-4 text-crestline-400" /><span className="text-xs text-crestline-300">Auto-deposit: ${p.autoDepositAmt}/month</span></div>}</div>); })}{portfolios.length === 0 && <div className="col-span-full text-center py-12 text-slate-500"><ArrowTrendingUpIcon className="h-12 w-12 mx-auto mb-3 text-slate-700" /><p>No investment portfolios yet.</p></div>}</div>
  </div>);
}

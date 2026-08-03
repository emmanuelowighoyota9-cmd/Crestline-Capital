'use client';

import { useState, useEffect } from 'react';
import { UsersIcon, BanknotesIcon, ArrowTrendingUpIcon, ShieldCheckIcon, CreditCardIcon } from '../../../../components/Icons';

interface Metrics { totalUsers: number; activeUsers: number; suspendedUsers: number; kycPending: number; totalAccounts: number; totalCards: number; totalDeposits: number; weeklyTransactions: number; }

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/admin/dashboard').then(r => r.json()).then(d => { setMetrics(d.metrics); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-slate-800" /><div className="grid grid-cols-4 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-900/50" />)}</div></div>;

  const cards = [
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: UsersIcon, color: 'text-crestline-400', bg: 'bg-crestline-500/10' },
    { label: 'Active Users', value: metrics?.activeUsers || 0, icon: ShieldCheckIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Suspended', value: metrics?.suspendedUsers || 0, icon: ShieldCheckIcon, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'KYC Pending', value: metrics?.kycPending || 0, icon: UsersIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Accounts', value: metrics?.totalAccounts || 0, icon: BanknotesIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Cards', value: metrics?.totalCards || 0, icon: CreditCardIcon, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Total Deposits', value: `$${((metrics?.totalDeposits || 0) / 1e6).toFixed(1)}M`, icon: ArrowTrendingUpIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Weekly Txn', value: metrics?.weeklyTransactions || 0, icon: ArrowTrendingUpIcon, color: 'text-crestline-400', bg: 'bg-crestline-500/10' },
  ];

  return (<div className="space-y-8"><div><h1 className="text-2xl font-bold text-white">Executive Dashboard</h1><p className="text-slate-400 mt-1">Platform overview and key metrics</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(card => (<div key={card.label} className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div><p className="mt-3 text-2xl font-bold text-white">{card.value}</p><p className="text-sm text-slate-400">{card.label}</p></div>))}</div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2><div className="grid gap-3">{[{ label: 'User Management', desc: 'View all users, KYC approvals, account controls', href: '/admin/users' },{ label: 'Transaction Ledger', desc: 'Monitor transactions, flag suspicious activity', href: '/admin/transactions' },{ label: 'Security Center', desc: 'Audit logs, failed login attempts, fraud alerts', href: '/admin/security' }].map(action => (<a key={action.label} href={action.href} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/30 p-4 hover:border-amber-500/20 transition-all"><div><p className="text-sm font-medium text-white">{action.label}</p><p className="text-xs text-slate-500 mt-0.5">{action.desc}</p></div><span className="text-amber-400 text-sm">→</span></a>))}</div></div>
      <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><h2 className="text-lg font-semibold text-white mb-4">System Status</h2><div className="space-y-3">{[{ label: 'API Gateway', status: 'Operational', pct: 99.9 },{ label: 'Database', status: 'Operational', pct: 100 },{ label: 'Auth Service', status: 'Operational', pct: 99.8 },{ label: 'Transaction Engine', status: 'Operational', pct: 100 },{ label: 'Fraud Detection', status: 'Operational', pct: 99.7 }].map(sys => (<div key={sys.label} className="flex items-center justify-between"><span className="text-sm text-slate-400">{sys.label}</span><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${sys.pct}%` }} /></div><span className="text-xs text-emerald-400 w-14 text-right">{sys.pct}%</span></div></div>))}</div></div>
    </div>
  </div>);
}

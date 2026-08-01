'use client';

import { useState, useEffect } from 'react';
import { BanknotesIcon, ArrowTrendingUpIcon, CreditCardIcon, ArrowPathIcon } from '@/components/Icons';

interface Account { id: string; accountType: string; accountNumber: string; balance: number; status: string; }

interface Transaction { id: string; type: string; amount: number; description: string; reference: string; createdAt: string; fromAccount?: { accountType: string }; toAccount?: { accountType: string }; }

interface Card { id: string; cardType: string; lastFour: string; status: string; cardBrand: string; }

interface Portfolio { id: string; name: string; totalInvested: number; currentValue: number; returns: number; }

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts').then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/cards').then(r => r.json()),
      fetch('/api/investments').then(r => r.json()),
    ]).then(([acc, txn, crd, inv]) => {
      setAccounts(acc.accounts || []);
      setTransactions((txn.transactions || []).slice(0, 5));
      setCards(crd.cards || []);
      setPortfolios(inv.portfolios || []);
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalInvested = portfolios.reduce((sum, p) => sum + (p.currentValue || 0), 0);

  if (loading) {
    return (<div className="space-y-6 animate-pulse"><div className="h-8 w-48 rounded-lg bg-slate-800" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-900/50" />)}</div><div className="h-64 rounded-2xl bg-slate-900/50" /></div>);
  }

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-white">Welcome back</h1><p className="text-slate-400 mt-1">Here&apos;s your financial overview</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-crestline-500/20 bg-gradient-to-br from-crestline-600/10 to-slate-900/50 p-6"><div className="flex items-center gap-2 text-crestline-400"><BanknotesIcon className="h-5 w-5" /><span className="text-sm font-medium">Total Balance</span></div><p className="mt-3 text-3xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><p className="mt-1 text-sm text-slate-400">{accounts.length} active account{accounts.length !== 1 ? 's' : ''}</p></div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><div className="flex items-center gap-2 text-emerald-400"><ArrowTrendingUpIcon className="h-5 w-5" /><span className="text-sm font-medium">Investments</span></div><p className="mt-3 text-3xl font-bold text-white">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><p className="mt-1 text-sm text-slate-400">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</p></div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><div className="flex items-center gap-2 text-violet-400"><CreditCardIcon className="h-5 w-5" /><span className="text-sm font-medium">Active Cards</span></div><p className="mt-3 text-3xl font-bold text-white">{cards.filter(c => c.status === 'active').length}</p><p className="mt-1 text-sm text-slate-400">{cards.length} total card{cards.length !== 1 ? 's' : ''}</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: 'Send Money', href: '/dashboard/transfer', icon: ArrowPathIcon, color: 'text-crestline-400' },{ label: 'View Accounts', href: '/dashboard/accounts', icon: BanknotesIcon, color: 'text-emerald-400' },{ label: 'Manage Cards', href: '/dashboard/cards', icon: CreditCardIcon, color: 'text-violet-400' },{ label: 'Investments', href: '/dashboard/investments', icon: ArrowTrendingUpIcon, color: 'text-amber-400' }].map(action => (<a key={action.label} href={action.href} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/30 p-4 transition-all hover:border-crestline-500/20 hover:bg-slate-900/50"><action.icon className={`h-5 w-5 ${action.color}`} /><span className="text-sm font-medium text-white">{action.label}</span></a>))}
      </div>
      <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-white">Recent Transactions</h2><a href="/dashboard/accounts" className="text-sm text-crestline-400 hover:text-crestline-300">View all →</a></div>
        {transactions.length === 0 ? (<p className="text-sm text-slate-500 text-center py-8">No transactions yet. Start by funding your account.</p>) : (
          <div className="space-y-3">{transactions.map(txn => (<div key={txn.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-800/30 p-3"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${txn.type === 'deposit' || txn.type === 'admin_credit' ? 'bg-emerald-500/10 text-emerald-400' : txn.type === 'withdrawal' || txn.type === 'admin_debit' ? 'bg-amber-500/10 text-amber-400' : 'bg-crestline-500/10 text-crestline-400'}`}><ArrowPathIcon className="h-4 w-4" /></div><div><p className="text-sm font-medium text-white">{txn.description || txn.type}</p><p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p></div></div><span className={`text-sm font-semibold ${txn.toAccount && !txn.fromAccount ? 'text-emerald-400' : 'text-white'}`}>{txn.toAccount && !txn.fromAccount ? '+' : ''}{txn.fromAccount && !txn.toAccount ? '-' : ''}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>))}</div>
        )}
      </div>
    </div>
  );
}

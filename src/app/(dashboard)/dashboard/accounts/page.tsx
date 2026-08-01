'use client';

import { useState, useEffect } from 'react';
import { BanknotesIcon } from '@/components/Icons';

interface Account { id: string; accountType: string; accountNumber: string; balance: number; status: string; currency: string; createdAt: string; }
interface Transaction { id: string; type: string; amount: number; description: string; reference: string; createdAt: string; fromAccount?: { accountNumber: string; accountType: string }; toAccount?: { accountNumber: string; accountType: string }; }

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d.accounts || []); if (d.accounts?.length > 0) setSelectedAccount(d.accounts[0]); });
    fetch('/api/transactions').then(r => r.json()).then(d => { setTransactions(d.transactions || []); setLoading(false); });
  }, []);

  function getAccountTransactions(accNumber: string) { return transactions.filter(t => t.fromAccount?.accountNumber === accNumber || t.toAccount?.accountNumber === accNumber); }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-40 rounded bg-slate-800" /><div className="h-64 rounded-2xl bg-slate-900/50" /></div>;

  return (<div className="space-y-8">
    <h1 className="text-2xl font-bold text-white">Accounts</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{accounts.map(acc => (<button key={acc.id} onClick={() => setSelectedAccount(acc)} className={`text-left rounded-2xl border p-6 transition-all ${selectedAccount?.id === acc.id ? 'border-crestline-500/30 bg-crestline-500/5' : 'border-white/5 bg-slate-900/50 hover:border-white/10'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><BanknotesIcon className="h-5 w-5 text-crestline-400" /><span className="text-sm font-medium text-white capitalize">{acc.accountType}</span></div><span className={`text-xs px-2 py-0.5 rounded-full ${acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{acc.status}</span></div><p className="mt-4 text-2xl font-bold text-white">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><p className="mt-1 text-xs text-slate-500">{acc.accountNumber}</p></button>))}</div>
    {selectedAccount && (<div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6"><div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-white">{selectedAccount.accountType.charAt(0).toUpperCase() + selectedAccount.accountType.slice(1)} — {selectedAccount.accountNumber}</h2></div>{getAccountTransactions(selectedAccount.accountNumber).length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No transactions for this account</p> : <div className="space-y-3">{getAccountTransactions(selectedAccount.accountNumber).slice(0, 20).map(txn => (<div key={txn.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-800/30 p-3"><div><p className="text-sm font-medium text-white">{txn.description || txn.type}</p><p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleDateString()} · {txn.reference?.slice(-8)}</p></div><span className={`text-sm font-semibold ${txn.toAccount?.accountNumber === selectedAccount.accountNumber ? 'text-emerald-400' : 'text-white'}`}>{txn.toAccount?.accountNumber === selectedAccount.accountNumber ? '+' : '-'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>))}</div>}</div>)}
  </div>);
}

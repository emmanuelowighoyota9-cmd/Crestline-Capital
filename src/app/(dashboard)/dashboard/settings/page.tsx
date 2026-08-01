'use client';

import { useState, useEffect } from 'react';

interface UserProfile { firstName: string; lastName: string; email: string; phone: string; }

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({ firstName: '', lastName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setProfile({ firstName: d.user.firstName || '', lastName: d.user.lastName || '', email: d.user.email || '', phone: d.user.phone || '' }); setLoading(false); }); }, []);

  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); setSaving(true); setMessage(null);
    try { const res = await fetch('/api/user', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed'); setMessage({ type: 'success', text: 'Profile updated successfully' }); } catch (err: any) { setMessage({ type: 'error', text: err.message }); } finally { setSaving(false); }
  }

  if (loading) return null;

  return (<div className="space-y-8"><h1 className="text-2xl font-bold text-white">Settings</h1>
    <div className="max-w-lg rounded-2xl border border-white/5 bg-slate-900/50 p-6">
      <div className="flex items-center gap-4 mb-8"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-crestline-500/20 text-crestline-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg></div><div><h2 className="text-lg font-semibold text-white">Profile</h2><p className="text-sm text-slate-400">{profile.email}</p></div></div>
      {message && <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border border-red-500/20 bg-red-500/5 text-red-400'}`}>{message.text}</div>}
      <form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-300">First Name</label><input type="text" required value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="mt-1.5 block w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white focus:border-crestline-500 focus:outline-none" /></div><div><label className="block text-sm font-medium text-slate-300">Last Name</label><input type="text" required value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="mt-1.5 block w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white focus:border-crestline-500 focus:outline-none" /></div></div><div><label className="block text-sm font-medium text-slate-300">Phone</label><input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="mt-1.5 block w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white focus:border-crestline-500 focus:outline-none" /></div><button type="submit" disabled={saving} className="rounded-xl bg-crestline-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crestline-500 disabled:opacity-50 transition-all">{saving ? 'Saving...' : 'Save Changes'}</button></form>
    </div>
  </div>);
}

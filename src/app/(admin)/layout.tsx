'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, ShieldCheckIcon, Bars3Icon, XMarkIcon } from '@/components/Icons';

type AdminUser = { id: string; email: string; firstName: string; lastName: string; role: string };

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowTrendingUpIcon },
  { href: '/admin/security', label: 'Security', icon: ShieldCheckIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user || d.user.role !== 'admin') { router.push('/login'); return; } setAdmin(d.user); }); }, [router]);

  async function handleLogout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); }

  if (!admin) return null;

  return (<div className="min-h-screen bg-slate-950">
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-4 py-3 lg:hidden"><Link href="/admin/dashboard" className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-red-600"><span className="text-xs font-bold text-white">A</span></div><span className="text-sm font-semibold text-white">Admin Panel</span></Link><button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-400">{sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}</button></div>
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-amber-500/10 bg-slate-950/95 backdrop-blur-xl transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex flex-col h-full"><div className="flex items-center gap-2.5 px-6 py-5 border-b border-amber-500/10"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-red-600"><span className="text-sm font-bold text-white">A</span></div><div><span className="text-base font-bold text-white">Crestline</span><span className="text-xs text-amber-400 block -mt-0.5">Admin Panel</span></div></div><nav className="flex-1 space-y-1 p-4">{navItems.map(item => { const isActive = pathname === item.href || pathname.startsWith(item.href + '/'); return (<Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><item.icon className="h-5 w-5" />{item.label}</Link>); })}</nav><div className="border-t border-white/5 p-4"><Link href="/dashboard" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 mb-3 px-3">← Back to Dashboard</Link><button onClick={handleLogout} className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left">Sign Out</button></div></div></aside>
    {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
    <main className="lg:pl-64"><div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</div></main>
  </div>);
}

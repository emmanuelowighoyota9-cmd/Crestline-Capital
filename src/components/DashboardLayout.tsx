import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BanknotesIcon, CreditCardIcon, ChartBarIcon, ArrowTrendingUpIcon, ArrowPathIcon, CogIcon, ShieldCheckIcon, Bars3Icon, XMarkIcon } from '@/components/Icons';

type User = { id: string; email: string; firstName: string; lastName: string; role: string };

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BanknotesIcon },
  { href: '/dashboard/accounts', label: 'Accounts', icon: ArrowPathIcon },
  { href: '/dashboard/transfer', label: 'Transfer', icon: ArrowTrendingUpIcon },
  { href: '/dashboard/cards', label: 'Cards', icon: CreditCardIcon },
  { href: '/dashboard/investments', label: 'Investments', icon: ChartBarIcon },
  { href: '/dashboard/security', label: 'Security', icon: ShieldCheckIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
      else router.push('/login');
    });
  }, [router]);

  async function handleLogout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-crestline-500 to-crestline-700"><span className="text-xs font-bold text-white">C</span></div><span className="text-sm font-semibold text-white">Crestline</span></Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-400">{sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}</button>
      </div>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-slate-950/95 backdrop-blur-xl transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crestline-500 to-crestline-700"><span className="text-sm font-bold text-white">C</span></div><span className="text-base font-bold text-white">Crestline<span className="text-crestline-400">Capital</span></span></div>
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (<Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-crestline-500/10 text-crestline-400 border border-crestline-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><item.icon className="h-5 w-5 flex-shrink-0" />{item.label}</Link>);
            })}
          </nav>
          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-3 mb-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-crestline-500/20 text-crestline-400 text-sm font-semibold">{user.firstName[0]}{user.lastName[0]}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p><p className="text-xs text-slate-500 truncate">{user.email}</p></div></div>
            <button onClick={handleLogout} className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left">Sign Out</button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
      <main className="lg:pl-64"><div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</div></main>
    </div>
  );
}

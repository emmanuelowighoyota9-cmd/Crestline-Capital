import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from './Icons';
import { useState } from 'react';

export default function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-crestline-500 to-crestline-700"><span className="text-sm font-bold text-white">C</span></div>
          <span className="text-lg font-bold tracking-tight text-white">Crestline<span className="text-crestline-400">Capital</span></span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/about" className="text-sm text-slate-400 transition-colors hover:text-white">About</Link>
          <Link href="/services/personal" className="text-sm text-slate-400 transition-colors hover:text-white">Personal</Link>
          <Link href="/services/business" className="text-sm text-slate-400 transition-colors hover:text-white">Business</Link>
          <Link href="/services/grants" className="text-sm text-slate-400 transition-colors hover:text-white">Grants</Link>
          <Link href="/faq" className="text-sm text-slate-400 transition-colors hover:text-white">FAQ</Link>
          <Link href="/contact" className="text-sm text-slate-400 transition-colors hover:text-white">Contact</Link>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white hover:bg-white/5">Log In</Link>
          <Link href="/register" className="rounded-lg bg-crestline-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-crestline-500 hover:shadow-lg hover:shadow-crestline-500/25">Open Account</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400">{open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}</button>
      </div>
      {open && (
        <div className="border-t border-white/5 bg-slate-900/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {['About','Personal','Business','Grants','FAQ','Contact'].map(item => (
              <Link key={item} href={`/${item.toLowerCase() === 'personal' ? 'services/personal' : item.toLowerCase() === 'business' ? 'services/business' : item.toLowerCase() === 'grants' ? 'services/grants' : item.toLowerCase()}`} className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">{item}</Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
              <Link href="/login" className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-white/5">Log In</Link>
              <Link href="/register" className="flex-1 rounded-lg bg-crestline-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-crestline-500">Open Account</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

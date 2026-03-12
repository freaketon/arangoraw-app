'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'This Week', icon: '▦' },
  { href: '/stories', label: 'Stories', icon: '◈' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 h-screen bg-bg-secondary border-r border-border flex flex-col fixed left-0 top-0 z-40">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-accent-gold text-base font-bold tracking-wider">ARANGO</span>
          <span className="text-text-muted text-base font-light tracking-wider">RAW</span>
        </div>
      </div>
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-accent-gold bg-bg-tertiary border-r-2 border-accent-gold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <span className="text-xs w-4 text-center opacity-60">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

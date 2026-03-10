'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Command Center', icon: 'â' },
  { href: '/weekly-planner', label: 'Weekly Planner', icon: 'â¦' },
  { href: '/episodes', label: 'Episodes', icon: 'âª' },
  { href: '/story-library', label: 'Story Library', icon: 'â' },
  { href: '/research-library', label: 'Research Library', icon: 'â' },
  { href: '/script-studio', label: 'Script Studio', icon: 'â' },
  { href: '/packaging-studio', label: 'Packaging Studio', icon: 'â«' },
  { href: '/analytics', label: 'Analytics', icon: 'â' },
  { href: '/settings', label: 'Settings', icon: 'â' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen bg-bg-secondary border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-accent-gold text-lg font-bold tracking-wider">ARANGO</span>
          <span className="text-text-muted text-lg font-light tracking-wider">RAW</span>
        </div>
        <div className="text-[10px] text-text-muted tracking-[3px] uppercase mt-0.5">Media System</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
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

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border">
        <div className="text-[10px] text-text-muted">v1.0 â Single Operator</div>
      </div>
    </aside>
  );
}

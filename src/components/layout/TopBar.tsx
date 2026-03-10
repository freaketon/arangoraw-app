'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/weekly-planner': 'Weekly Planner',
  '/episodes': 'Episodes',
  '/story-library': 'Story Library',
  '/research-library': 'Research Library',
  '/script-studio': 'Script Studio',
  '/packaging-studio': 'Packaging Studio',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname || ''] || 'ArangoRAW';

  return (
    <header className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-sm font-medium text-text-primary tracking-wide">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-xs text-text-muted">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <div className="w-7 h-7 rounded-full bg-accent-gold-dim flex items-center justify-center text-xs font-bold text-bg-primary">
          A
        </div>
      </div>
    </header>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/': 'This Week',
  '/stories': 'Stories',
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
        <Link href="/settings" className="text-text-muted hover:text-text-primary transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

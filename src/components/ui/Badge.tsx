type BadgeVariant = 'default' | 'gold' | 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'muted';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-bg-elevated text-text-secondary',
  gold: 'bg-[#2a2000] text-accent-gold',
  green: 'bg-[#002a10] text-accent-green',
  red: 'bg-[#2a0000] text-accent-red',
  blue: 'bg-[#001a2a] text-accent-blue',
  amber: 'bg-[#2a2000] text-accent-amber',
  purple: 'bg-[#1a0030] text-accent-purple',
  muted: 'bg-bg-tertiary text-text-muted',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Convenience mappers
export function ApprovalBadge({ state }: { state: string }) {
  const variant: BadgeVariant =
    state === 'Approved' ? 'green' :
    state === 'Rejected' ? 'red' :
    state === 'Revision Requested' ? 'amber' : 'gold';
  return <Badge variant={variant}>{state}</Badge>;
}

export function StateBadge({ state }: { state: string }) {
  const variant: BadgeVariant =
    state === 'Published' || state === 'Reviewed' ? 'green' :
    state === 'Ready to Publish' ? 'blue' :
    state === 'Idea' ? 'muted' : 'gold';
  return <Badge variant={variant}>{state}</Badge>;
}

export function PillarBadge({ pillar }: { pillar: string }) {
  const map: Record<string, BadgeVariant> = {
    'Psychology of Chaos': 'purple',
    'Media Intelligence': 'blue',
    'Identity Shift': 'gold',
    'Physics of Business': 'green',
    'The Survivor': 'red',
    'External Mirrors': 'amber',
  };
  return <Badge variant={map[pillar] || 'default'}>{pillar}</Badge>;
}

interface BadgeProps {
  variant?: 'default' | 'blue' | 'green' | 'red' | 'yellow'
  children: React.ReactNode
  dot?: boolean
}

const variants = {
  default: 'bg-surface-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  blue: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  red: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  yellow: 'bg-accent-50 text-accent-700 dark:bg-amber-900/30 dark:text-amber-300',
}

const dotColors = {
  default: 'bg-gray-400',
  blue: 'bg-primary-500',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
  yellow: 'bg-accent-500',
}

export function Badge({ variant = 'default', children, dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}

export function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { variant: 'default' | 'blue' | 'green' | 'red' | 'yellow'; label: string }> = {
    brouillon: { variant: 'default', label: 'Brouillon' },
    envoye: { variant: 'blue', label: 'Envoyé' },
    accepte: { variant: 'green', label: 'Accepté' },
    refuse: { variant: 'red', label: 'Refusé' },
  }
  const s = map[statut] || { variant: 'default', label: statut }
  return <Badge variant={s.variant} dot>{s.label}</Badge>
}

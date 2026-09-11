import { motion } from 'framer-motion'

/**
 * Brand loading screen: the monogram is drawn as if traced in flour while a
 * basil leaf drifts down beside it.
 */
export function BrandLoader({ label = 'Preparando a mesa...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 bg-stucco">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
          <motion.circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="var(--color-gold-500)"
            strokeWidth="1.5"
            strokeDasharray="290"
            initial={{ strokeDashoffset: 290, opacity: 0.2 }}
            animate={{ strokeDashoffset: 0, opacity: 1 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.text
            x="60"
            y="72"
            textAnchor="middle"
            fill="var(--color-chianti-600)"
            style={{ font: '600 40px var(--font-display)' }}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse' }}
          >
            CF
          </motion.text>
        </svg>

        <motion.span
          className="absolute -right-2 top-2 text-2xl"
          aria-hidden
          initial={{ y: -18, rotate: -20, opacity: 0 }}
          animate={{ y: 74, rotate: 25, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌿
        </motion.span>
      </div>

      <p className="font-display text-xl italic text-ink-700">{label}</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-cream-200/70">
      <div className="h-56 w-full animate-pulse bg-cream-300/70" />
      <div className="space-y-3 p-6">
        <div className="h-5 w-2/3 animate-pulse rounded bg-cream-300/80" />
        <div className="h-3 w-full animate-pulse rounded bg-cream-300/60" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-cream-300/60" />
        <div className="h-9 w-32 animate-pulse rounded-full bg-cream-300/70" />
      </div>
    </div>
  )
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

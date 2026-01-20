import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Entry card skeleton - matches TodayView entry cards
function SkeletonEntryCard() {
  return (
    <div className="rounded-lg border bg-card p-4 border-l-4 border-l-muted">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
      </div>
    </div>
  )
}

// Generic card skeleton
function SkeletonCard({ lines = 2 }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 15}%` }} />
        ))}
      </div>
    </div>
  )
}

// Stats bar skeleton - matches day stats
function SkeletonStats() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-1 w-1 rounded-full" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-1 w-1 rounded-full" />
      <Skeleton className="h-4 w-14" />
    </div>
  )
}

// List of skeleton cards
function SkeletonList({ count = 3, variant = "entry" }) {
  const Component = variant === "entry" ? SkeletonEntryCard : SkeletonCard
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}

// Chart skeleton - for progress view
function SkeletonChart({ height = 200 }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}

// Habit accordion skeleton - for shelf view
function SkeletonHabitAccordion({ count = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Reflection skeleton - for review view
function SkeletonReflection() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-32 w-full rounded-md" />
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonEntryCard,
  SkeletonStats,
  SkeletonList,
  SkeletonChart,
  SkeletonHabitAccordion,
  SkeletonReflection,
}

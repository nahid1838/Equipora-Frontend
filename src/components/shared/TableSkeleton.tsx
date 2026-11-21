export default function TableSkeleton({ label, columns = 5 }: { label: string; columns?: number }) {
  return (
    <div role="status" className="min-w-0 overflow-hidden rounded-2xl border bg-card">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="border-b px-5 py-5"><div className="h-5 w-36 rounded bg-muted" /></div>
        <div className="grid gap-3 border-b bg-muted/50 px-5 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, index) => <div key={index} className="h-3 rounded bg-muted-foreground/15" />)}
        </div>
        {[1, 2, 3].map((row) => (
          <div key={row} className="grid gap-3 border-b px-5 py-4 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, index) => <div key={index} className="h-4 rounded bg-muted" />)}
          </div>
        ))}
      </div>
    </div>
  )
}

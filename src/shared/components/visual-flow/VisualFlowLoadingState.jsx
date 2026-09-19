import { CardSkeleton } from '../feedback/Skeleton'

/** Reuses the shared skeleton component — no bespoke loading spinner invented for VisualFlow. */
export function VisualFlowLoadingState() {
  return (
    <div className="grid h-full gap-3 p-4">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

/**
 * Cursor-pagination history helper — see docs "Pagination Contract" and
 * "Facebook Cursor Pagination". Facebook's API returns opaque `after`/
 * `before` cursors, never numeric pages; treating it as `page=1,2,3` is
 * explicitly disallowed by the spec this module was built against.
 *
 * This keeps a simple cursor stack per "page visited so far": index 0 is
 * always the first page (cursor `null`). `goNext(nextCursor)` pushes a new
 * cursor (truncating any forward history if the user had gone back and is
 * now moving forward again down a different path — there isn't one here
 * since content is read-only, but the stack stays correct regardless).
 * `goPrevious()` just moves the index back; the cursor for that page is
 * already known, no extra request shape is needed for "previous".
 */
export function createCursorStack() {
  return { cursors: [null], index: 0 }
}

export function currentCursor(stack) {
  return stack.cursors[stack.index]
}

export function canGoPrevious(stack) {
  return stack.index > 0
}

export function pushNextCursor(stack, nextCursor) {
  const cursors = stack.cursors.slice(0, stack.index + 1)
  cursors.push(nextCursor)
  return { cursors, index: stack.index + 1 }
}

export function goToPreviousCursor(stack) {
  if (!canGoPrevious(stack)) return stack
  return { ...stack, index: stack.index - 1 }
}

export function resetCursorStack() {
  return createCursorStack()
}

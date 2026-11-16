const MAX_CONCURRENT_QUERIES = 4

export const QUERY_PRIORITY = Object.freeze({
  page: 0,
  supporting: 1,
  background: 2,
})

export const QUERY_POLICY = Object.freeze({
  page: Object.freeze({
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  }),
  supporting: Object.freeze({
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  }),
  background: Object.freeze({
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  }),
})

export const QUERY_CLIENT_DEFAULTS = Object.freeze({
  staleTime: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
})

let queue = []
let inFlight = 0
let sequence = 0
let drainScheduled = false

function getPriority(priority) {
  return QUERY_PRIORITY[priority] ?? QUERY_PRIORITY.page
}

function abortError(signal) {
  return signal?.reason || new DOMException('The query was aborted.', 'AbortError')
}

function scheduleDrain() {
  if (drainScheduled) return
  drainScheduled = true
  queueMicrotask(() => {
    drainScheduled = false
    queue.sort((a, b) => a.priority - b.priority || a.sequence - b.sequence)

    while (inFlight < MAX_CONCURRENT_QUERIES && queue.length) {
      const job = queue.shift()
      job.signal?.removeEventListener('abort', job.onAbort)
      if (job.signal?.aborted) {
        job.reject(abortError(job.signal))
        continue
      }

      inFlight += 1
      Promise.resolve()
        .then(job.run)
        .then(job.resolve, job.reject)
        .finally(() => {
          inFlight -= 1
          scheduleDrain()
        })
    }
  })
}

export function scheduleQuery(run, { priority = 'page', signal } = {}) {
  return new Promise((resolve, reject) => {
    const job = {
      run,
      resolve,
      reject,
      signal,
      priority: getPriority(priority),
      sequence: sequence++,
    }

    if (signal?.aborted) {
      reject(abortError(signal))
      return
    }

    job.onAbort = () => {
      const index = queue.indexOf(job)
      if (index === -1) return
      queue.splice(index, 1)
      reject(abortError(signal))
    }
    signal?.addEventListener('abort', job.onAbort, { once: true })
    queue.push(job)
    scheduleDrain()
  })
}

export function prioritizeQuery(queryFn, priority = 'page') {
  return (context) => scheduleQuery(
    () => queryFn(context),
    { priority, signal: context?.signal },
  )
}

export function queryPolicyOptions(priority = 'page', overrides = {}) {
  const { priority: _ignoredPriority, ...options } = overrides
  return {
    ...(QUERY_POLICY[priority] || QUERY_POLICY.page),
    ...options,
    meta: {
      ...options.meta,
      priority,
    },
  }
}

export function getQuerySchedulerSnapshot() {
  return { inFlight, queued: queue.length, maxConcurrent: MAX_CONCURRENT_QUERIES }
}

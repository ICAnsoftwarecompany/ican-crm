// Status of one ad set / ad for its tab dot.
export function adSetStatus(issues, adSetId) {
  return statusOf(issues.filter((issue) => issue.stage === 'adSets' && issue.adSetId === adSetId))
}

export function adStatus(issues, adId) {
  return statusOf(issues.filter((issue) => issue.stage === 'ads' && issue.adId === adId))
}

function statusOf(list) {
  if (list.some((issue) => issue.severity === 'error')) return 'error'
  if (list.some((issue) => issue.severity === 'warning')) return 'warning'
  return 'complete'
}

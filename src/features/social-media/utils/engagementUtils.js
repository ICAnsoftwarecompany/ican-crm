/**
 * See docs "Engagement Calculation". `calculateTotalEngagement` is a raw
 * sum of available engagement counts — it is explicitly NOT an
 * "engagement rate" (a rate needs a denominator like reach/impressions/
 * followers, which this API does not provide). Never label its output
 * "Engagement Rate" anywhere in the UI.
 *
 * @param {import('../adapters/socialAdapterContract').SocialEngagement} engagement
 * @returns {number|null} null when every component is null (nothing to sum), otherwise the sum of whichever components are numbers.
 */
export function calculateTotalEngagement(engagement) {
  const values = [engagement?.likes, engagement?.comments, engagement?.shares, engagement?.saves].filter(
    (value) => typeof value === 'number' && Number.isFinite(value)
  )
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0)
}

/**
 * Ranks content by total engagement, descending. Content with no engagement
 * data at all (`calculateTotalEngagement` returns null) sorts last rather
 * than being treated as zero, so a post with genuinely 0 likes/comments/
 * shares outranks one where the engagement summary just wasn't returned.
 *
 * @param {import('../adapters/socialAdapterContract').SocialContent[]} content
 * @param {number} [limit]
 */
export function rankContentByEngagement(content = [], limit) {
  const ranked = [...content].sort((a, b) => {
    const totalA = calculateTotalEngagement(a.engagement)
    const totalB = calculateTotalEngagement(b.engagement)
    if (totalA === null && totalB === null) return 0
    if (totalA === null) return 1
    if (totalB === null) return -1
    return totalB - totalA
  })
  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked
}

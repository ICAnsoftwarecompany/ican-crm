import { buildCases } from './casesSeed'
import { createRandom } from './seedUtils'

/** CSAT responses for resolved/closed demo cases (deterministic per template). */
const COMMENTS = {
  5: ['خدمة ممتازة وسريعة', 'شكرًا على المتابعة', 'Great support, thank you!'],
  4: ['كويس بس الرد اتأخر شوية', 'Good, solved on the second visit'],
  3: ['اتحلت بس بعد وقت طويل'],
  2: ['الفني اتأخر عن الميعاد', 'Had to call several times'],
  1: ['المشكلة لسه موجودة', 'محدش رد عليا'],
}

export function buildFeedbackResponses(manifest) {
  const random = createRandom(`csat-${manifest.template}`)
  return buildCases(manifest)
    .filter((item) => item.resolved_at && random.chance(0.65))
    .map((item, index) => {
      const score = random.pick([5, 5, 5, 4, 4, 4, 3, 2, 1])
      const respondedAt = new Date(new Date(item.resolved_at).getTime() + random.int(1, 30) * 60 * 60 * 1000)
      return {
        id: `fb-${index + 1}`,
        case_id: item.id,
        survey: 'csat',
        score,
        comment: random.chance(0.5) ? random.pick(COMMENTS[score]) : null,
        channel: item.source_channel,
        responded_at: (respondedAt.getTime() > Date.now() ? new Date() : respondedAt).toISOString(),
      }
    })
}

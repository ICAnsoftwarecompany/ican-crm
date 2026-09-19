import { z } from 'zod'

export function getActivityReportSchema(t) {
  return z.object({
    outcome: z.string().trim().min(1, t('activities.validation.outcomeRequired')),
    summary: z.string().trim().min(1, t('activities.validation.summaryRequired')),
    rating: z.string().optional(),
    next_action: z.string().trim().min(1, t('activities.validation.nextActionRequired')),
    next_action_at: z.string().optional(),
    notes: z.string().optional(),
  }).superRefine((value, ctx) => {
    if (['call_again', 'schedule_meeting', 'create_task'].includes(value.next_action) && !value.next_action_at?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_action_at'], message: t('activities.validation.nextActionAtRequired') })
    }
  })
}

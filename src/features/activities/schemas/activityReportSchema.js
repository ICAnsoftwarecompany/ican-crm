import { z } from 'zod'

export const activityReportSchema = z.object({
  outcome: z.string().trim().min(1, 'النتيجة مطلوبة'),
  summary: z.string().trim().min(1, 'ملخص التقرير مطلوب'),
  rating: z.string().optional(),
  next_action: z.string().trim().min(1, 'اختر الإجراء التالي'),
  next_action_at: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((value, ctx) => {
  if (['call_again', 'schedule_meeting', 'create_task'].includes(value.next_action) && !value.next_action_at?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['next_action_at'], message: 'وقت الإجراء التالي مطلوب' })
  }
})

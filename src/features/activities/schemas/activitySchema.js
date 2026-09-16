import { z } from 'zod'

export const activitySchema = z.object({
  type: z.enum(['call', 'meeting']),
  title: z.string().trim().min(1, 'العنوان مطلوب'),
  related_type: z.enum(['lead', 'customer']),
  taskable_id: z.string().trim().min(1, 'رقم العميل أو الليد مطلوب'),
  assigned_to: z.string().optional(),
  team_id: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  start_at: z.string().trim().min(1, 'وقت البداية مطلوب'),
  end_at: z.string().optional(),
  reminder_before: z.string().optional(),
  reminder_unit: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  call_provider: z.string().optional(),
  mode: z.string().optional(),
  meeting_link: z.string().optional(),
  location: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.type === 'meeting' && value.mode === 'online' && !value.meeting_link?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['meeting_link'], message: 'رابط الاجتماع مطلوب للاجتماع الأونلاين' })
  }

  if (value.type === 'meeting' && value.mode === 'offline' && !value.location?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['location'], message: 'مكان الاجتماع مطلوب للاجتماع الحضوري' })
  }

  if (value.type === 'meeting' && value.start_at && value.end_at) {
    const start = new Date(value.start_at).getTime()
    const end = new Date(value.end_at).getTime()
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['end_at'], message: 'النهاية يجب أن تكون بعد البداية' })
    }
  }
})

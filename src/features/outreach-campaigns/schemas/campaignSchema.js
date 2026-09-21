import { z } from 'zod'

/**
 * Channel-aware validation for the Campaign Wizard, following the same
 * zod + `.superRefine` convention as features/activities/schemas/activitySchema.js.
 *
 * Validates the wizard's in-memory form state shape (not the backend
 * payload — see utils/buildCampaignPayload.js for that transformation).
 */
export const campaignFormSchema = z
  .object({
    name: z.string().trim().min(1, 'outreachCampaigns.validation.nameRequired'),
    channel: z.enum(['whatsapp', 'gmail', 'messenger'], {
      errorMap: () => ({ message: 'outreachCampaigns.validation.channelRequired' }),
    }),
    audience: z.object({
      customers: z.array(z.unknown()).min(1, 'outreachCampaigns.validation.audienceRequired'),
    }),
    content: z.object({
      message: z.string().trim().optional(),
      subject: z.string().trim().optional(),
      whatsapp: z
        .object({
          phoneNumberId: z.string().trim().optional(),
          templateId: z.union([z.string(), z.number()]).optional(),
          templateGeneral: z.boolean().optional(),
          headerParams: z.array(z.string()).optional(),
          bodyParams: z.array(z.string()).optional(),
        })
        .optional(),
      gmail: z
        .object({
          mailboxEmail: z.string().trim().optional(),
        })
        .optional(),
      messenger: z
        .object({
          externalId: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
    }),
    schedule: z.object({
      date: z.string().trim().min(1, 'outreachCampaigns.validation.scheduleDateRequired'),
      time: z.string().trim().min(1, 'outreachCampaigns.validation.scheduleTimeRequired'),
    }),
    team: z.object({
      userIds: z.array(z.union([z.string(), z.number()])).optional(),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.channel === 'whatsapp') {
      if (!value.content?.whatsapp?.phoneNumberId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'whatsapp', 'phoneNumberId'],
          message: 'outreachCampaigns.validation.phoneNumberRequired',
        })
      }
      if (!value.content?.whatsapp?.templateId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'whatsapp', 'templateId'],
          message: 'outreachCampaigns.validation.templateRequired',
        })
      }
    }

    if (value.channel === 'gmail') {
      if (!value.content?.gmail?.mailboxEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'gmail', 'mailboxEmail'],
          message: 'outreachCampaigns.validation.mailboxRequired',
        })
      }
      if (!value.content?.subject?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'subject'],
          message: 'outreachCampaigns.validation.subjectRequired',
        })
      }
      if (!value.content?.message?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'message'],
          message: 'outreachCampaigns.validation.messageRequired',
        })
      }
    }

    if (value.channel === 'messenger') {
      if (!value.content?.messenger?.externalId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'messenger', 'externalId'],
          message: 'outreachCampaigns.validation.externalIdRequired',
        })
      }
      if (!value.content?.message?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'message'],
          message: 'outreachCampaigns.validation.messageRequired',
        })
      }
    }
  })

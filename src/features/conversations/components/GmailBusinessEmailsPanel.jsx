import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, Loader2, MailPlus, RefreshCw, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '../../../shared/utils/cn'
import { useGmailBusinessEmailMutations, useGmailBusinessEmails } from '../hooks/useGmailConversations'

function normalizeBusinessEmailAccounts(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.data)) return value.data.data
  return []
}

function buildSavePayload(account, emails) {
  return {
    data: [
      {
        integration_id: account?.integration_id,
        emails: emails.map((email) => ({
          email: email.email,
          display_name: email.display_name || email.displayName || '',
          saved_in_database: Boolean(email.saved_in_database),
          is_primary: Boolean(email.is_primary),
        })),
      },
    ],
  }
}

function getEmailState(email) {
  if (email?.saved_in_database) return { label: 'محفوظ', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  return { label: 'غير محفوظ', className: 'bg-amber-50 text-amber-700 border-amber-200' }
}

function BusinessEmailBadge({ email }) {
  const state = getEmailState(email)

  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] font-black', state.className)}>
      {email?.saved_in_database ? <CheckCircle2 size={12} /> : <MailPlus size={12} />}
      {state.label}
    </span>
  )
}

function BusinessEmailRow({ account, email, savingKey, onSave }) {
  const emailKey = `${account?.integration_id}-${email?.email}`
  const isSaving = savingKey === emailKey

  return (
    <div className="rounded-lg border border-[#E5EEF2] bg-white px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-[#111827]">{email.email}</p>
          {email.display_name ? (
            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#64748B]">{email.display_name}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {email.is_primary ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 text-[10px] font-black text-[#1D4ED8]">
              <ShieldCheck size={12} />
              أساسي
            </span>
          ) : null}
          <BusinessEmailBadge email={email} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {email.is_default ? (
            <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-black text-[#475569]">افتراضي</span>
          ) : null}
          {email.verification_status ? (
            <span className="rounded-full bg-[#F0FDFA] px-2 py-0.5 text-[10px] font-black text-[#0F766E]">
              {email.verification_status}
            </span>
          ) : null}
        </div>

        {!email.saved_in_database ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSave(account, [email], emailKey)}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#F4C7C3] bg-white px-2 text-[11px] font-black text-[#B3261E] transition hover:bg-[#FFF4F2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            حفظ
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function GmailBusinessEmailsPanel({ enabled = true, compact = false }) {
  const [expanded, setExpanded] = useState(false)
  const [savingKey, setSavingKey] = useState('')
  const businessEmailsQuery = useGmailBusinessEmails(undefined, {
    enabled,
    staleTime: 60 * 1000,
  })
  const mutations = useGmailBusinessEmailMutations()

  const accounts = useMemo(() => normalizeBusinessEmailAccounts(businessEmailsQuery.data), [businessEmailsQuery.data])
  const unsavedCount = useMemo(() => (
    accounts.reduce((count, account) => (
      count + (Array.isArray(account.emails) ? account.emails.filter((email) => !email.saved_in_database).length : 0)
    ), 0)
  ), [accounts])

  const handleSave = async (account, emails, key) => {
    if (!account?.integration_id || !emails.length) return

    try {
      setSavingKey(key || `account-${account.integration_id}`)
      await mutations.saveBusinessEmails.mutateAsync(buildSavePayload(account, emails))
      toast.success('تم حفظ إيميلات Gmail بنجاح')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر حفظ إيميلات Gmail')
    } finally {
      setSavingKey('')
    }
  }

  if (!enabled) return null

  return (
    <section className="border-b border-[#EEF2F4] bg-[#FFFDFD]">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start transition hover:bg-[#FFF7F6]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FCE8E6] text-[#D93025]">
            <MailPlus size={17} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-black text-[#111827]">إيميلات Gmail Business</span>
            <span className="block truncate text-[11px] font-semibold text-[#64748B]">
              {businessEmailsQuery.isLoading ? 'جاري التحميل...' : `${accounts.length} حساب - ${unsavedCount} غير محفوظ`}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {unsavedCount > 0 ? (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D93025] px-2 text-[10px] font-black text-white">
              {unsavedCount > 99 ? '99+' : unsavedCount}
            </span>
          ) : null}
          <ChevronDown size={15} className={cn('text-[#64748B] transition', expanded && 'rotate-180')} />
        </span>
      </button>

      {expanded ? (
        <div className={cn('space-y-2 overflow-y-auto px-3 pb-3', compact ? 'max-h-72' : 'max-h-96')}>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => businessEmailsQuery.refetch()}
              disabled={businessEmailsQuery.isFetching}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#E5EEF2] bg-white px-2 text-[11px] font-black text-[#475569] disabled:opacity-60"
            >
              <RefreshCw size={12} className={cn(businessEmailsQuery.isFetching && 'animate-spin')} />
              تحديث
            </button>
          </div>

          {businessEmailsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          ) : null}

          {!businessEmailsQuery.isLoading && accounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#F4C7C3] bg-white px-3 py-4 text-center text-xs font-bold text-[#64748B]">
              لا توجد إيميلات Business متاحة حاليا.
            </div>
          ) : null}

          {accounts.map((account) => {
            const emails = Array.isArray(account.emails) ? account.emails : []
            const unsavedEmails = emails.filter((email) => !email.saved_in_database)
            const accountSavingKey = `account-${account.integration_id}`

            return (
              <div key={account.integration_id || account.gmail_account} className="rounded-xl border border-[#F4C7C3] bg-[#FFFBFA] p-2">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-[#111827]">{account.gmail_account || 'Gmail account'}</p>
                    <p className="text-[11px] font-semibold text-[#64748B]">
                      Integration #{account.integration_id}
                    </p>
                  </div>
                  {unsavedEmails.length > 0 ? (
                    <button
                      type="button"
                      disabled={savingKey === accountSavingKey}
                      onClick={() => handleSave(account, unsavedEmails, accountSavingKey)}
                      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-[#D93025] px-2 text-[11px] font-black text-white transition hover:bg-[#B3261E] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingKey === accountSavingKey ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      حفظ غير المحفوظ
                    </button>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {emails.map((email) => (
                    <BusinessEmailRow
                      key={`${account.integration_id}-${email.email}`}
                      account={account}
                      email={email}
                      savingKey={savingKey}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

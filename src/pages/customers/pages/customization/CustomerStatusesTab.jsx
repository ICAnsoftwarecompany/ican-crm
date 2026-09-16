import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Edit3, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { QUERY_KEYS } from '../../../../shared/constants/queryKeys'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { Button } from '../../../../shared/components/ui/Button'
import { Spinner } from '../../../../shared/components/ui/Spinner'
import { StatusDefinitionDialog } from './StatusDefinitionDialog'

function flattenStatuses(response) {
  const data = response?.data

  if (Array.isArray(response)) return response
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  return Object.entries(data).flatMap(([type, items]) => {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      ...item,
      type: item.type || type,
    }))
  })
}

function isEnabled(value) {
  return Number(value) === 1
}

function getLeadStatuses(statuses = []) {
  return statuses
    .filter((status) => String(status?.type || '').toLowerCase() === 'lead')
    .sort((first, second) => Number(first?.priority || 0) - Number(second?.priority || 0))
}

function getStageKindLabel(status) {
  if (isEnabled(status?.is_deal)) return 'حالة التعاقد/الشراء'
  if (isEnabled(status?.is_lost)) return 'حالة الخسارة'
  if (isEnabled(status?.is_retarget)) return 'حالة إعادة الاستهداف'
  return 'حالة عادية'
}

function getEnabledMeta(status) {
  const entries = []

  if (isEnabled(status?.is_deal)) {
    entries.push('حالة التعاقد/الشراء')
  }
  if (isEnabled(status?.is_lost)) {
    entries.push('حالة الخسارة')
  }
  if (isEnabled(status?.is_retarget)) {
    entries.push('حالة إعادة الاستهداف')
  }
  if (isEnabled(status?.has_resone)) {
    entries.push('إجبار وجود سبب')
  }

  return entries
}

export function CustomerStatusesTab() {
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  const statusesQuery = useQuery({
    queryKey: QUERY_KEYS.statuses.list,
    queryFn: () => definitionsApi.getStatuses(),
    select: flattenStatuses,
  })

  const invalidateStatuses = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses.all })
  }

  const createStatusMutation = useMutation({
    mutationFn: definitionsApi.createStatus,
    onSuccess: () => {
      toast.success('تمت إضافة الحالة')
      invalidateStatuses()
      closeDialog()
    },
    onError: (error) => {
      toast.error(extractMessage(error, 'تعذر إضافة الحالة'))
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => definitionsApi.updateStatus(id, payload),
    onSuccess: () => {
      toast.success('تم تعديل الحالة')
      invalidateStatuses()
      closeDialog()
    },
    onError: (error) => {
      toast.error(extractMessage(error, 'تعذر تعديل الحالة'))
    },
  })

  const statuses = statusesQuery.data || []
  const leadStatuses = useMemo(() => getLeadStatuses(statuses), [statuses])

  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedStatus(null)
  }

  const openEditDialog = (status) => {
    setDialogMode('edit')
    setSelectedStatus(status)
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedStatus(null)
  }

  const handleSubmit = (payload) => {
    if (dialogMode === 'edit' && selectedStatus?.id) {
      updateStatusMutation.mutate({ id: selectedStatus.id, payload })
      return
    }

    createStatusMutation.mutate(payload)
  }

  const isSaving = createStatusMutation.isPending || updateStatusMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">تعريف حالات Lead</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            الحالات هنا تعمل دائمًا كـ lead و active=1، وترتب كتسليم مراحل حسب الأولوية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => statusesQuery.refetch()}
            disabled={statusesQuery.isFetching}
            className="gap-2"
          >
            <RefreshCw size={16} className={statusesQuery.isFetching ? 'animate-spin' : ''} />
            تحديث
          </Button>
          <Button variant="primary" className="gap-2" onClick={openCreateDialog}>
            <Plus size={16} />
            تعريف حالة
          </Button>
        </div>
      </div>

      {statusesQuery.isLoading && (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Spinner size="lg" />
        </div>
      )}

      {statusesQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {extractMessage(statusesQuery.error, 'تعذر تحميل الحالات')}
        </div>
      )}

      {!statusesQuery.isLoading && !statusesQuery.isError && leadStatuses.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
          لا توجد حالات Lead مسجلة بعد.
        </div>
      )}

      {!statusesQuery.isLoading && !statusesQuery.isError && leadStatuses.length > 0 && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="mb-3 text-sm font-bold text-[var(--text-muted)]">تسلسل مراحل الـ Lead حسب الترتيب</div>
          <div className="flex flex-wrap items-stretch gap-2">
            {leadStatuses.map((status, index) => {
              const enabledMeta = getEnabledMeta(status)
              const stageKindLabel = getStageKindLabel(status)

              return (
                <div key={status.id} className="flex items-center gap-2">
                  <article className="min-w-[240px] max-w-[300px] rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20"
                        style={{ backgroundColor: status.color || '#64748B' }}
                        title="لون الحالة"
                      >
                        <CheckCircle2 size={18} className="text-white" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-sm font-black text-[var(--text)]">{status.status}</h4>
                          <span className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-xs font-bold text-[#1D4ED8]">
                            ترتيب {status.priority ?? '-'}
                          </span>
                        </div>

                        <div className="mt-1 text-xs font-semibold text-[#334155]">{stageKindLabel}</div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {enabledMeta.map((meta) => (
                            <span
                              key={meta}
                              className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#166534]"
                            >
                              {meta}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openEditDialog(status)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
                      >
                        <Edit3 size={14} />
                        تعديل
                      </button>
                    </div>
                  </article>

                  {index < leadStatuses.length - 1 ? (
                    <span className="text-lg font-black text-[#94A3B8]">→</span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <StatusDefinitionDialog
        open={Boolean(dialogMode)}
        mode={dialogMode}
        selectedStatus={selectedStatus}
        statuses={statuses}
        loading={isSaving}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

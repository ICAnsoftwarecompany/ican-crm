import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ClipboardCheck } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useQualityMutations } from '../api/qualityApi'

/** Case header action (resolved / closed cases): queue this case for a quality review. */
export function SendToQualityButton({ caseItem }) {
  const { t } = useTranslation()
  const { queueCase } = useQualityMutations()
  return (
    <Button size="sm" variant="outline" loading={queueCase.isPending} onClick={() => queueCase.mutate(caseItem.id, { onSuccess: () => toast.success(t('service.quality.queued')) })}>
      <ClipboardCheck size={14} aria-hidden="true" />
      {t('service.quality.sendToReview')}
    </Button>
  )
}

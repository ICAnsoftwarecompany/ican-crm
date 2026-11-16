import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { KnowledgeWorkspace } from '../../features/service'

/** /service/knowledge — internal knowledge base. */
export function ServiceKnowledgePage() {
  const { t } = useTranslation()
  usePageHeader({ title: t('service.knowledge.title'), icon: BookOpen })

  return (
    <div className="p-4 lg:p-5">
      <KnowledgeWorkspace basePath="/service/knowledge" />
    </div>
  )
}

export default ServiceKnowledgePage

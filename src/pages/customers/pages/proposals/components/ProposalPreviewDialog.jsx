import { useTranslation } from 'react-i18next'
import { ProposalModal } from './ProposalModal'
import { ProposalRenderer } from './renderer/ProposalRenderer'

export function ProposalPreviewDialog({ open, onClose, content, proposal, options, products }) {
  const { t } = useTranslation()
  return (
    <ProposalModal open={open} onClose={onClose} title={t('proposals.previewProposal')} className="max-w-6xl">
      <div className="bg-[#EEF4FA] p-4">
        <ProposalRenderer content={content} proposal={proposal} options={options} products={products} />
      </div>
    </ProposalModal>
  )
}

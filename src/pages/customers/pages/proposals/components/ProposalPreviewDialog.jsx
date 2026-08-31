import { ProposalModal } from './ProposalModal'
import { ProposalRenderer } from './renderer/ProposalRenderer'

export function ProposalPreviewDialog({ open, onClose, content, proposal, options, products }) {
  return (
    <ProposalModal open={open} onClose={onClose} title="معاينة العرض" className="max-w-6xl">
      <div className="bg-[#EEF4FA] p-4">
        <ProposalRenderer content={content} proposal={proposal} options={options} products={products} />
      </div>
    </ProposalModal>
  )
}

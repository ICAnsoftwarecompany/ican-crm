import { ProposalRenderer } from './renderer/ProposalRenderer'

export function ProposalCanvas({ content, proposal, options, products, selected, onSelect }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#EEF4FA] px-6 py-6">
      <div className="mx-auto max-w-5xl">
        <ProposalRenderer
          content={content}
          proposal={proposal}
          options={options}
          products={products}
          editable
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </main>
  )
}

import { ProposalRenderer } from './renderer/ProposalRenderer'

export function ProposalCanvas({ content, proposal, options, products, items, selected, onSelect }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--surface-2)] px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <ProposalRenderer
          content={content}
          proposal={proposal}
          options={options}
          products={products}
          items={items}
          editable
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </main>
  )
}

import { MessageCircle, RefreshCw } from 'lucide-react'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { getMessengerConversationId } from '../utils/messengerConversations'
import { MessengerConversationFilters } from './MessengerConversationFilters'
import { MessengerConversationListItem } from './MessengerConversationListItem'
import { MessengerLogoIcon } from './MessengerNavbarButton'

export function MessengerConversationListPanel({
  conversations,
  filteredConversations,
  conversationsQuery,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  onConvertToLead,
  onToggleStatus,
}) {
  return (
    <section className="min-h-[360px] rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
            <MessengerLogoIcon size={22} />
          </span>
          <div>
            <h2 className="text-sm font-black text-[var(--text)]">كل المحادثات</h2>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{conversations.length} محادثة</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => conversationsQuery.refetch()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[#F8FAFC] hover:text-[var(--text)]"
          title="تحديث المحادثات"
        >
          <RefreshCw size={15} />
        </button>
      </header>

      <MessengerConversationFilters
        conversations={conversations}
        filters={filters}
        onChange={onFiltersChange}
        resultCount={filteredConversations.length}
      />

      <ResourceState
        isLoading={conversationsQuery.isLoading}
        error={conversationsQuery.error}
        empty={conversations.length === 0}
        emptyIcon={<MessageCircle size={24} />}
        emptyTitle="لا توجد محادثات ماسنجر"
        emptyDescription="\u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0623\u0648\u0644 \u0645\u062d\u0627\u062f\u062b\u0629 \u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627."
        onRetry={conversationsQuery.refetch}
      >
        <div className="max-h-[calc(100vh-345px)] overflow-y-auto p-2 xl:max-h-[calc(100vh-16rem)]">
          {!conversationsQuery.isLoading && filteredConversations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#CFE8EB] bg-[#FAFDFE] px-4 py-6 text-center text-sm font-bold text-[#64748B]">
              لا توجد محادثات مطابقة للفلاتر الحالية.
            </div>
          ) : null}

          {filteredConversations.map((conversation) => {
            const id = getMessengerConversationId(conversation)
            return (
              <MessengerConversationListItem
                key={id}
                conversation={conversation}
                isActive={String(selectedId) === String(id)}
                onSelect={onSelect}
                onConvertToLead={onConvertToLead}
                onToggleStatus={onToggleStatus}
              />
            )
          })}
        </div>
      </ResourceState>
    </section>
  )
}

import { useTranslation } from 'react-i18next'
import { Copy, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../../../../shared/components/ui/Button'
import { useProposalMutations } from '../../../../../features/proposals'
import { buildVersionPayload } from '../utils/proposalBuilderContent'

export function ProposalVersionsPanel({ proposal, versions = [], currentVersion, content, onSelectVersion, disableVersionActions = false }) {
  const { t } = useTranslation()
  const mutations = useProposalMutations()

  const handleDuplicate = async () => {
    if (!currentVersion || disableVersionActions) return
    const payload = buildVersionPayload(currentVersion, proposal, content, {
      name: `${currentVersion.name || 'Version'}${t('proposals.versions.copySuffix')}`,
      is_current: false,
    })
    await mutations.createProposalVersion.mutateAsync({ proposalId: proposal.id, payload })
    toast.success(t('proposals.versions.versionDuplicatedToast'))
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-xs font-black text-[var(--text-muted)]">{t('proposals.versions.versionsTitle')}</div>
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={!currentVersion || disableVersionActions} loading={mutations.createProposalVersion.isPending}>
            <Copy size={15} />
            {t('proposals.versions.duplicateButton')}
          </Button>
        </div>
        <div className="space-y-2">
          {versions.map((version) => (
            <div key={version.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <button type="button" onClick={() => onSelectVersion?.(version.id)} className="w-full text-start">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-[var(--text)]">{version.name || t('proposals.versions.versionFallback', { id: version.id })}</span>
                  {version.is_current ? <Star size={14} className="text-[#F59E0B]" fill="currentColor" /> : null}
                </div>
                {version.change_note ? <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{version.change_note}</p> : null}
              </button>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await mutations.setCurrentProposalVersion.mutateAsync({ proposalId: proposal.id, versionId: version.id })
                      toast.success(t('proposals.versions.setCurrent'))
                    } catch { toast.error(t('proposals.builder.saveState.autoSaveFailed')) }
                  }}
                  disabled={version.is_current || disableVersionActions || mutations.setCurrentProposalVersion.isPending}
                >
                  <Star size={14} />
                  {t('proposals.versions.setCurrent')}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#EF4444]"
                  onClick={async () => {
                    if (!window.confirm(t('proposals.versions.deleteVersion') + '?')) return
                    try {
                      await mutations.deleteProposalVersion.mutateAsync({ proposalId: proposal.id, versionId: version.id })
                      if (String(currentVersion?.id) === String(version.id)) {
                        const remaining = versions.find(item => String(item.id) !== String(version.id))
                        if (remaining) onSelectVersion?.(remaining.id)
                      }
                    } catch { toast.error(t('proposals.builder.saveState.autoSaveFailed')) }
                  }}
                  disabled={versions.length <= 1 || disableVersionActions || mutations.deleteProposalVersion.isPending}
                  aria-label={t('proposals.versions.deleteVersion')}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {!versions.length ? <p className="text-xs font-semibold text-[var(--text-muted)]">{t('proposals.versions.noVersionsYet')}</p> : null}
        </div>
      </section>
    </div>
  )
}

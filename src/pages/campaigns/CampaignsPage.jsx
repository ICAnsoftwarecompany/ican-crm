import { useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Badge } from '../../shared/components/ui/Badge'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useAdsLists, useCampaignLists, useCampaignMutations } from '../../features/campaigns/hooks/useCampaigns'
import { displayValue, extractMessage } from '../../shared/utils/apiResponse'

export function CampaignsPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [feedback, setFeedback] = useState('')
  const campaigns = useCampaignLists()
  const ads = useAdsLists()
  const mutations = useCampaignMutations()

  const activeCampaigns = campaigns.active.data || []
  const inactiveCampaigns = campaigns.inactive.data || []
  const activeAds = ads.active.data || []
  const activeForms = ads.forms.data || []

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setFeedback('')
    if (!form.name.trim()) {
      setFeedback(t('campaigns.nameRequired'))
      return
    }

    try {
      await mutations.saveCampaign.mutateAsync(form)
      setForm({ name: '', description: '', status: 'active' })
      setFeedback(t('campaigns.saveSuccess'))
    } catch (error) {
      setFeedback(extractMessage(error, t('campaigns.saveError')))
    }
  }

  const renderCampaign = (campaign, index, status) => (
    <article key={campaign.id || index} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{displayValue(campaign.name || campaign.title, `Campaign #${campaign.id || index + 1}`)}</h3>
          <p className="text-sm text-[var(--text-muted)]">{displayValue(campaign.description || campaign.objective)}</p>
        </div>
        <Badge variant={status === 'active' ? 'success' : 'default'}>{status}</Badge>
      </div>
    </article>
  )

  return (
    <div>
      <PageToolbar title={t('nav.campaigns')} description={t('campaigns.description')} />
      {feedback && <div className="mb-4 rounded-lg bg-[#E8F9FA] text-[#007A80] text-sm p-3">{feedback}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <form onSubmit={handleCreate} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3 h-fit">
          <h2 className="font-bold">{t('campaigns.newCampaign')}</h2>
          <Input label={t('campaigns.nameLabel')} name="name" value={form.name} onChange={handleChange} />
          <Input label={t('campaigns.descriptionLabel')} name="description" value={form.description} onChange={handleChange} />
          <label className="grid gap-1.5 text-sm font-medium font-arabic text-[var(--text)]">
            {t('campaigns.statusLabel')}
            <select name="status" value={form.status} onChange={handleChange} className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3">
              <option value="active">{t('campaigns.statusActive')}</option>
              <option value="inactive">{t('campaigns.statusInactive')}</option>
            </select>
          </label>
          <Button type="submit" loading={mutations.saveCampaign.isPending}>
            <Plus size={16} />
            {t('campaigns.saveCampaign')}
          </Button>
        </form>

        <section className="grid gap-4">
          <ResourceState
            isLoading={campaigns.isLoading}
            error={campaigns.error}
            empty={activeCampaigns.length + inactiveCampaigns.length === 0}
            emptyIcon={<Megaphone size={24} />}
            emptyTitle={t('campaigns.noCampaigns')}
            onRetry={() => {
              campaigns.active.refetch()
              campaigns.inactive.refetch()
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {activeCampaigns.map((campaign, index) => renderCampaign(campaign, index, 'active'))}
              {inactiveCampaigns.map((campaign, index) => renderCampaign(campaign, index, 'inactive'))}
            </div>
          </ResourceState>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              <h2 className="font-bold mb-3">{t('campaigns.activeAds')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('campaigns.adsCount', { count: activeAds.length })}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              <h2 className="font-bold mb-3">{t('campaigns.adForms')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('campaigns.formsCount', { count: activeForms.length })}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../../shared/components/ui/Button'
import { matchBulkLocations, locationDisplayName } from '../../domain/geoTargeting'
import { metaAssetsSource } from '../../data/metaAssetsSource'
import { SegmentedControl } from '../fields'
import { inputClassName } from '../fields/FieldFrame'

/** "Add locations in bulk": one location per line (or comma separated). */
export function GeoBulkDialog({ isOpen, onClose, onAdd, accountId }) {
  const { t, i18n } = useTranslation()
  const [text, setText] = useState('')
  const [mode, setMode] = useState('include')
  const [result, setResult] = useState(null)
  const [matching, setMatching] = useState(false)

  const match = async () => {
    const catalog = metaAssetsSource.geoCatalogForBulk()
    if (catalog) {
      setResult(matchBulkLocations(catalog, text))
      return
    }
    setMatching(true)
    const matched = []
    const unmatched = []
    for (const line of text.split(/[\n,\u061B;]+/).map((value) => value.trim()).filter(Boolean)) {
      const { items } = await metaAssetsSource.searchGeoLocations({ query: line, accountId }).catch(() => ({ items: [] }))
      if (items[0]) matched.push(items[0])
      else unmatched.push(line)
    }
    setMatching(false)
    setResult({ matched, unmatched })
  }

  const close = () => {
    setText('')
    setResult(null)
    onClose()
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={close}
      size="lg"
      title={t('campaignWizard.geo.bulkTitle')}
      description={t('campaignWizard.geo.bulkDescription')}
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>{t('campaignWizard.common.cancel')}</Button>
          {result?.matched.length ? (
            <Button onClick={() => { onAdd(result.matched, mode); close() }}>{t('campaignWizard.geo.bulkAdd', { count: result.matched.length })}</Button>
          ) : (
            <Button onClick={match} loading={matching} disabled={!text.trim()}>{t('campaignWizard.geo.bulkMatch')}</Button>
          )}
        </div>
      )}
    >
      <div className="grid gap-3">
        <SegmentedControl value={mode} onChange={setMode} ariaLabel={t('campaignWizard.geo.mode')} options={[{ value: 'include', label: t('campaignWizard.geo.include') }, { value: 'exclude', label: t('campaignWizard.geo.exclude') }]} />
        <textarea
          rows={7}
          value={text}
          onChange={(event) => { setText(event.target.value); setResult(null) }}
          placeholder={t('campaignWizard.geo.bulkPlaceholder')}
          className={`${inputClassName(false)} h-auto py-2 leading-6`}
        />
        {result && (
          <div className="grid gap-2 text-sm">
            <p className="font-semibold text-[var(--notification-success)]">{t('campaignWizard.geo.bulkMatched', { count: result.matched.length })}</p>
            {result.matched.length > 0 && <p className="text-xs leading-5 text-[var(--text-muted)]">{result.matched.map((item) => locationDisplayName(item, i18n.language)).join(' · ')}</p>}
            {result.unmatched.length > 0 && (
              <>
                <p className="font-semibold text-[var(--notification-warning)]">{t('campaignWizard.geo.bulkUnmatched', { count: result.unmatched.length })}</p>
                <p className="text-xs leading-5 text-[var(--text-muted)]">{result.unmatched.join(' · ')}</p>
              </>
            )}
          </div>
        )}
      </div>
    </AppModal>
  )
}

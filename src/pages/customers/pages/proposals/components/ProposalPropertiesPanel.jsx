import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Layers, Palette, Settings2, Trash2 } from 'lucide-react'

import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { getBlockLabel } from '../constants/proposalBlockTypes'
import { DEFAULT_PROPOSAL_DESIGN } from '../constants/proposalBuilderDefaults'

function Field({ label, value, onChange, type = 'text', rows }) {
  if (rows) {
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-black text-[var(--text-muted)]">{label}</span>
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-[#00C2CB]"
        />
      </label>
    )
  }

  return <Input label={label} type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} />
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)]"
    >
      <span>{label}</span>
      <span className="text-[#007A80]">{checked ? <Eye size={17} /> : <EyeOff size={17} />}</span>
    </button>
  )
}

function BlockFields({ block, onChangeBlock, t }) {
  const data = block.data || {}
  const styles = block.styles || {}
  const setData = (key, value) => onChangeBlock({ ...block, data: { ...data, [key]: value } })
  const setStyle = (key, value) => onChangeBlock({ ...block, styles: { ...styles, [key]: value } })
  const f = (key) => t(`proposals.builder.fields.${key}`)

  return (
    <div className="space-y-4">
      <Field label={f('blockName')} value={block.name} onChange={(value) => onChangeBlock({ ...block, name: value })} />
      <Select
        label={f('alignment')}
        value={styles.align || 'start'}
        onChange={(value) => setStyle('align', value)}
        options={[
          { value: 'start', label: f('alignStart') },
          { value: 'center', label: f('alignCenter') },
          { value: 'end', label: f('alignEnd') },
        ]}
      />

      {block.type === 'cover' ? (
        <>
          <Field label={f('eyebrow')} value={data.eyebrow} onChange={(value) => setData('eyebrow', value)} />
          <Field label={f('title')} value={data.title} onChange={(value) => setData('title', value)} />
          <Field label={f('description')} value={data.subtitle} rows={4} onChange={(value) => setData('subtitle', value)} />
          <Field label={f('coverImageUrl')} value={data.image_url} onChange={(value) => setData('image_url', value)} />
        </>
      ) : null}

      {block.type === 'heading' ? (
        <>
          <Field label={f('text')} value={data.text} onChange={(value) => setData('text', value)} />
          <Select
            label={f('headingLevel')}
            value={data.level || 'h2'}
            onChange={(value) => setData('level', value)}
            options={[
              { value: 'h1', label: f('levelLarge') },
              { value: 'h2', label: f('levelMedium') },
              { value: 'h3', label: f('levelSmall') },
            ]}
          />
          <Field label={f('color')} type="color" value={styles.color || DEFAULT_PROPOSAL_DESIGN.primary_color} onChange={(value) => setStyle('color', value)} />
        </>
      ) : null}

      {block.type === 'text' || block.type === 'terms' ? (
        <Field label={f('content')} value={data.content} rows={7} onChange={(value) => setData('content', value)} />
      ) : null}

      {block.type === 'image' ? (
        <>
          <Field label={f('imageUrl')} value={data.url} onChange={(value) => setData('url', value)} />
          <Field label={f('imageCaption')} value={data.caption} onChange={(value) => setData('caption', value)} />
        </>
      ) : null}

      {block.type === 'button' || block.type === 'link' ? (
        <>
          <Field label={f('text')} value={data.label} onChange={(value) => setData('label', value)} />
          <Field label={f('link')} value={data.url} onChange={(value) => setData('url', value)} />
        </>
      ) : null}

      {block.type === 'spacer' ? (
        <Field label={f('height')} type="number" value={data.height} onChange={(value) => setData('height', value)} />
      ) : null}

      {block.type === 'customer_info' ? (
        <>
          <Toggle label={f('showEmail')} checked={data.show_email !== false} onChange={(value) => setData('show_email', value)} />
          <Toggle label={f('showPhone')} checked={data.show_phone !== false} onChange={(value) => setData('show_phone', value)} />
          <Toggle label={f('showCompany')} checked={data.show_company !== false} onChange={(value) => setData('show_company', value)} />
        </>
      ) : null}

      {block.type === 'company_info' ? (
        <>
          <Field label={f('companyName')} value={data.name} onChange={(value) => setData('name', value)} />
          <Field label={f('email')} value={data.email} onChange={(value) => setData('email', value)} />
          <Field label={t('customers.phone')} value={data.phone} onChange={(value) => setData('phone', value)} />
          <Field label={f('title')} value={data.address} onChange={(value) => setData('address', value)} />
        </>
      ) : null}

      {block.type === 'products' || block.type === 'pricing' || block.type === 'video' ? (
        <>
          <Field label={f('title')} value={data.title} onChange={(value) => setData('title', value)} />
          {block.type === 'video' ? <Field label={f('videoUrl')} value={data.url} onChange={(value) => setData('url', value)} /> : null}
        </>
      ) : null}

      {block.type === 'signature' ? (
        <>
          <Field label={f('signerName')} value={data.signer_name} onChange={(value) => setData('signer_name', value)} />
          <Field label={f('signerTitle')} value={data.signer_title} onChange={(value) => setData('signer_title', value)} />
          <Field label={f('signatureLineLabel')} value={data.line_label} onChange={(value) => setData('line_label', value)} />
        </>
      ) : null}

      {block.type === 'custom' ? (
        <>
          <Field label={f('title')} value={data.label} onChange={(value) => setData('label', value)} />
          <Field label={f('customValue')} value={data.value} rows={4} onChange={(value) => setData('value', value)} />
        </>
      ) : null}
    </div>
  )
}

export function ProposalPropertiesPanel({
  content,
  selected,
  onChangeContent,
  onDeleteBlock,
}) {
  const { t } = useTranslation()
  const sections = content?.sections || []
  const selectedSection = sections.find((section) => section.id === selected?.id || section.id === selected?.sectionId)
  const selectedBlock = selected?.type === 'block'
    ? selectedSection?.blocks?.find((block) => block.id === selected.id)
    : null

  const updateSection = (sectionId, patch) => {
    onChangeContent({
      ...content,
      sections: sections.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)),
    })
  }

  const updateBlock = (nextBlock) => {
    onChangeContent({
      ...content,
      sections: sections.map((section) => (
        section.id === selectedSection.id
          ? { ...section, blocks: section.blocks.map((block) => (block.id === nextBlock.id ? nextBlock : block)) }
          : section
      )),
    })
  }

  const updateDesign = (key, value) => {
    onChangeContent({ ...content, design: { ...(content?.design || {}), [key]: value } })
  }

  return (
    <aside className="h-[calc(100vh-4.5rem)] w-[340px] shrink-0 overflow-y-auto border-s border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <Settings2 size={18} />
        </span>
        <div>
          <h2 className="text-sm font-black text-[var(--text)]">{t('proposals.builder.propertiesTitle')}</h2>
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('proposals.builder.propertiesSubtitle')}</p>
        </div>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-black text-[var(--text-muted)]">
            <Palette size={15} />
            {t('proposals.builder.generalDesign')}
          </div>
          <div className="space-y-3">
            <Field label={t('proposals.builder.proposalTitle')} value={content?.title} onChange={(value) => onChangeContent({ ...content, title: value })} />
            <Field label={t('proposals.builder.primaryColor')} type="color" value={content?.design?.primary_color || DEFAULT_PROPOSAL_DESIGN.primary_color} onChange={(value) => updateDesign('primary_color', value)} />
            <Field label={t('proposals.builder.fontSize')} type="number" value={content?.design?.font_size || 14} onChange={(value) => updateDesign('font_size', Number(value) || 14)} />
          </div>
        </section>

        {selectedSection ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-black text-[var(--text-muted)]">
              <Layers size={15} />
              {selectedBlock ? getBlockLabel(selectedBlock.type, t) || t('proposals.builder.blockFallback') : t('proposals.builder.sectionFallback')}
            </div>
            <div className="space-y-3">
              {!selectedBlock ? (
                <>
                  <Field label={t('proposals.builder.sectionName')} value={selectedSection.title} onChange={(value) => updateSection(selectedSection.id, { title: value })} />
                  <Field label={t('proposals.builder.sectionDescription')} value={selectedSection.description} onChange={(value) => updateSection(selectedSection.id, { description: value })} />
                  <Toggle label={t('proposals.builder.sectionVisible')} checked={selectedSection.is_visible !== false} onChange={(value) => updateSection(selectedSection.id, { is_visible: value })} />
                </>
              ) : (
                <>
                  <Toggle label={t('proposals.builder.blockVisible')} checked={selectedBlock.is_visible !== false} onChange={(value) => updateBlock({ ...selectedBlock, is_visible: value })} />
                  <BlockFields block={selectedBlock} onChangeBlock={updateBlock} t={t} />
                  <Button variant="danger" size="sm" className="w-full" onClick={() => onDeleteBlock(selectedSection.id, selectedBlock.id)}>
                    <Trash2 size={15} />
                    {t('proposals.builder.deleteBlock')}
                  </Button>
                </>
              )}
            </div>
          </section>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm font-bold text-[var(--text-muted)]">
            {t('proposals.builder.emptySelection')}
          </div>
        )}
      </div>
    </aside>
  )
}

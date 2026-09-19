import { useTranslation } from 'react-i18next'

function getProductLabel(product, t) {
  return [
    product?.name || t('customers.table.productFallback', { id: product?.id || '' }),
    product?.code ? `(${product.code})` : '',
    product?.price ? `- ${product.price}` : '',
  ].filter(Boolean).join(' ')
}

function getInterestLevels(t) {
  return [
    { value: 'high', label: t('activities.priority.high') },
    { value: 'medium', label: t('activities.priority.medium') },
    { value: 'low', label: t('activities.priority.low') },
  ]
}

export function FollowUpInterestedProductSection({
  form,
  updateForm,
  products = [],
  isProductsLoading = false,
  selectedProduct,
}) {
  const { t } = useTranslation()

  return (
    <div className="min-h-0 overflow-y-auto rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-black text-[#111827]">{t('customers.followUp.interest.addLabel')}</span>
          <span className="mt-0.5 block text-xs font-bold text-[#64748B]">
            {t('customers.followUp.interest.addHint')}
          </span>
        </span>
        <input
          type="checkbox"
          checked={Boolean(form.interest_enabled)}
          onChange={(event) => {
            const checked = event.target.checked
            updateForm('interest_enabled', checked)
            if (!checked) {
              updateForm('interest_product_id', '')
              updateForm('interest_note', '')
              updateForm('interest_level', 'high')
            }
          }}
          className="h-5 w-5 rounded border-[#BEEFF2] text-[#00AEB8] focus:ring-[#00C2CB]"
        />
      </label>

      {form.interest_enabled ? (
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium font-arabic text-[var(--text)]">{t('customers.followUp.interest.productLabel')}</span>
            <select
              value={form.interest_product_id}
              onChange={(event) => updateForm('interest_product_id', event.target.value)}
              disabled={isProductsLoading}
              className="h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="">{isProductsLoading ? t('customers.followUp.interest.loadingProducts') : t('customers.followUp.interest.chooseProduct')}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {getProductLabel(product, t)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium font-arabic text-[var(--text)]">{t('customers.followUp.interest.levelLabel')}</span>
            <select
              value={form.interest_level}
              onChange={(event) => updateForm('interest_level', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
            >
              {getInterestLevels(t).map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </label>

          {selectedProduct ? (
            <div className="rounded-xl border border-[#E5F7F8] bg-white p-2 text-xs font-bold text-[#64748B]">
              {selectedProduct.desc || selectedProduct.description || selectedProduct.code || t('customers.followUp.interest.productSelected')}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-[#111827]">{t('customers.followUp.interest.noteLabel')}</span>
            <textarea
              value={form.interest_note}
              onChange={(event) => updateForm('interest_note', event.target.value)}
              rows={3}
              className="w-full resize-y rounded-xl border border-[#D8E7EA] bg-white px-3 py-2 text-sm font-bold text-[#111827] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              placeholder={t('customers.followUp.optionalPlaceholder')}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}

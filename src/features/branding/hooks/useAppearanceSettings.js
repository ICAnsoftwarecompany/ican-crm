import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useThemeStore } from '../../../store/themeStore'
import { DEFAULT_BRAND_TOKENS } from '../api/brandingApi'

/**
 * Composition hook for the Appearance settings page. Owns no state of its
 * own — reads/writes the shared themeStore — so the page component stays a
 * thin render layer.
 */
export function useAppearanceSettings() {
  const { t } = useTranslation()
  const brandPrimary = useThemeStore((s) => s.brandPrimary)
  const brandAccent = useThemeStore((s) => s.brandAccent)
  const isDark = useThemeStore((s) => s.isDark)
  const setBrandPrimary = useThemeStore((s) => s.setBrandPrimary)
  const setBrandAccent = useThemeStore((s) => s.setBrandAccent)
  const saveBrandTokensAction = useThemeStore((s) => s.saveBrandTokens)
  const resetBrandTokensAction = useThemeStore((s) => s.resetBrandTokens)

  const isDefault =
    brandPrimary === DEFAULT_BRAND_TOKENS.brandPrimary && brandAccent === DEFAULT_BRAND_TOKENS.brandAccent

  const handleSave = () => {
    saveBrandTokensAction()
    toast.success(t('branding.appearance.toast.saved'))
  }

  const handleReset = () => {
    resetBrandTokensAction()
    toast.success(t('branding.appearance.toast.reset'))
  }

  return {
    brandPrimary,
    brandAccent,
    isDark,
    isDefault,
    setBrandPrimary,
    setBrandAccent,
    handleSave,
    handleReset,
  }
}

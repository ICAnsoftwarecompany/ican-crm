/**
 * Pure resolution of {lang, dir} from an i18next language code. Extracted
 * from App.jsx so the language -> direction contract (the root cause of a
 * historical bug where `dir` only updated via a Sidebar side effect and
 * never on initial load) has a single, independently testable definition.
 * See docs/ARCHITECTURE.md "Localization, direction, theme".
 */
export function resolveDocumentLanguageAttributes(language) {
  const lang = language?.startsWith('en') ? 'en' : 'ar'
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return { lang, dir }
}

/** Applies the resolved attributes to `document.documentElement`. Side-effecting — kept separate from the pure resolver above so the mapping itself stays trivially testable. */
export function syncDocumentLanguage(language) {
  const { lang, dir } = resolveDocumentLanguageAttributes(language)
  document.documentElement.lang = lang
  document.documentElement.dir = dir
}

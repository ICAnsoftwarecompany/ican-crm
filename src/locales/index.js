import ar from './ar/index.js'
import en from './en/index.js'

// i18next namespace stays 'common' (the app's existing defaultNS) so every
// existing t('customers.table.name')-style call keeps resolving unchanged.
export const resources = {
  ar: { common: ar },
  en: { common: en },
}

export default resources

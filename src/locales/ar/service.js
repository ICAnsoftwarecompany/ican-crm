import core from './service/core.js'
import phases from './service/phases.js'
import catalog from './service/catalog.js'
import terms from './service/terms.js'
import cases from './service/cases.js'
import workspace from './service/workspace.js'
import contacts from './service/contacts.js'
import settings from './service/settings.js'
import sla from './service/sla.js'
import knowledge from './service/knowledge.js'
import insights from './service/insights.js'
import catalogConfig from './service/catalogConfig.js'
import records from './service/records.js'
import assets from './service/assets.js'
import contracts from './service/contracts.js'
import billing from './service/billing.js'
import subscriptions from './service/subscriptions.js'
import scheduling from './service/scheduling.js'
import deliveries from './service/deliveries.js'

/**
 * نصوص إدارة العملاء (Customer Hub) — جذر المفاتيح `service.*`.
 * مقسمة حسب الموضوع داخل ./service/ (المجلد ليس Locale Module؛ الملف ده
 * بس هو المسجل في index.js). أضف ملف جزء لكل Sub-module لما يكبر.
 */
export default {
  ...core,
  ...phases,
  ...catalog,
  ...cases,
  ...workspace,
  ...contacts,
  ...settings,
  ...sla,
  ...knowledge,
  ...insights,
  ...catalogConfig,
  ...records,
  ...assets,
  ...contracts,
  ...billing,
  ...subscriptions,
  ...scheduling,
  ...deliveries,
  terms,
}

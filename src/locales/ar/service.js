import core from './service/core.js'
import phases from './service/phases.js'
import catalog from './service/catalog.js'
import terms from './service/terms.js'

/**
 * نصوص خدمة العملاء — جذر المفاتيح `service.*`.
 * مقسمة حسب الموضوع داخل ./service/ (المجلد ليس Locale Module؛ الملف ده
 * بس هو المسجل في index.js). أضف ملف جزء لكل Sub-module لما يكبر.
 */
export default {
  ...core,
  ...phases,
  ...catalog,
  terms,
}

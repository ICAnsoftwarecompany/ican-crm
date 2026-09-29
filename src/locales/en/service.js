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

/**
 * Customer Hub (Service Operations) copy — key root `service.*`.
 * Split by concern under ./service/ (this folder is not a locale module;
 * only this file is registered in index.js). Add a new part file per
 * sub-module when it grows (e.g. ./service/cases.js → `service.cases.*`).
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
  terms,
}

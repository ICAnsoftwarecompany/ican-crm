import core from './service/core.js'
import phases from './service/phases.js'
import catalog from './service/catalog.js'
import terms from './service/terms.js'

/**
 * Service Operations copy — key root `service.*`.
 * Split by concern under ./service/ (this folder is not a locale module;
 * only this file is registered in index.js). Add a new part file per
 * sub-module when it grows (e.g. ./service/cases.js → `service.cases.*`).
 */
export default {
  ...core,
  ...phases,
  ...catalog,
  terms,
}

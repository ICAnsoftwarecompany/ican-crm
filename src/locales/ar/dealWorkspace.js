import core from './dealWorkspace/core.js'
import pipeline from './dealWorkspace/pipeline.js'
import closing from './dealWorkspace/closing.js'
import team from './dealWorkspace/team.js'
import products from './dealWorkspace/products.js'
import contracts from './dealWorkspace/contracts.js'
import collaboration from './dealWorkspace/collaboration.js'
import insights from './dealWorkspace/insights.js'
import settings from './dealWorkspace/settings.js'
import hub from './dealWorkspace/hub.js'
import options from './dealWorkspace/options.js'

/**
 * Deals hub + Deal Workspace copy — key root `dealWorkspace.*` (rebuilt 2026-10-03).
 * Split by concern under ./dealWorkspace/ (that folder is not a locale module; only this file is
 * registered in index.js). Each part's top-level keys merge into `dealWorkspace`.
 */
export default {
  ...core,
  ...pipeline,
  ...closing,
  ...team,
  ...products,
  ...contracts,
  ...collaboration,
  ...insights,
  ...settings,
  ...hub,
  ...options,
}

import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, getMockManifest, registerSeed } from '../db'
import { MockHttpError } from '../errors'
import { getMockCurrentUser } from '../seeds/seedUtils'
import { nowIso } from '../utils'
import { LATEST_TEMPLATE_VERSION, TEMPLATE_VERSIONS, applyChange, changeStatus, templateChanges } from '../state/templateUpgrades'
import './communicationHandlers'
import './followUpsHandlers'
import './settingsHandlers'

registerSeed('templateInstallation', (manifest) => [{ template: manifest.template, installed_version: 1, installed_at: '2026-06-10T09:00:00.000Z', history: [] }])

const T = serviceEndpoints.templateInstallation
const installation = () => getCollection('templateInstallation')[0]
const diff = () => templateChanges(getMockManifest()).map((change) => ({ ...change, status: changeStatus(change, getCollection(change.entity)) }))
const state = () => {
  const inst = installation()
  const changes = inst.installed_version < LATEST_TEMPLATE_VERSION ? diff() : []
  return { ...inst, latest_version: LATEST_TEMPLATE_VERSION, upgrade_available: inst.installed_version < LATEST_TEMPLATE_VERSION, versions: TEMPLATE_VERSIONS, pending: changes.filter((entry) => entry.status !== 'already').length, conflicts: changes.filter((entry) => entry.status === 'conflict').length }
}

/** @type {import('../router').MockRoute[]} */
export const templateVersionHandlers = [
  { method: 'GET', path: T, handler: () => ({ data: state() }) },
  {
    method: 'POST',
    path: `${T}/upgrade`,
    handler: ({ body = {} }) => {
      const inst = installation()
      if (inst.installed_version >= LATEST_TEMPLATE_VERSION) throw new MockHttpError(409, 'TEMPLATE_UP_TO_DATE', 'Already on the latest version')
      const changes = diff()
      if (body.dry_run) return { data: { changes } }
      // Default: take every non-conflicting change, keep the tenant's value on conflicts ("keep mine").
      const choices = body.choices || {}
      const applied = []
      const skipped = []
      changes.forEach((change) => {
        const take = change.status === 'pending' ? choices[change.id] !== 'keep' : change.status === 'conflict' && choices[change.id] === 'take'
        if (take) {
          applyChange(change, getCollection(change.entity))
          applied.push(change.id)
        } else if (change.status !== 'already') skipped.push(change.id)
      })
      const user = getMockCurrentUser()
      inst.history.unshift({ from: inst.installed_version, to: LATEST_TEMPLATE_VERSION, applied, skipped, at: nowIso(), by: { id: user.id, name: user.name } })
      inst.installed_version = LATEST_TEMPLATE_VERSION
      return { data: { ...state(), applied, skipped } }
    },
  },
]

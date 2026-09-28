/**
 * Public surface of the Service Operations area.
 * Pages and other features import from here only — never from internal paths.
 * Keep this list short; export a sub-module only when something outside
 * features/service really needs it.
 */

// Core
export { createServiceApi, isModuleMocked } from './core/api/serviceHttp'
export { serviceKeys } from './core/constants/queryKeys'
export {
  SERVICE_MODULES,
  SERVICE_PHASES,
  CURRENT_SERVICE_PHASE,
  getServiceModule,
  getModulesForPhase,
} from './core/constants/serviceModules'
export { useServiceCapabilities, useServiceTerminology } from './core/capabilities/useServiceCapabilities'

// Core UI
export { ServiceMockBanner } from './core/components/ServiceMockBanner'
export { CapabilitiesOverview } from './core/components/CapabilitiesOverview'
export { ServiceRoadmap } from './core/components/ServiceRoadmap'

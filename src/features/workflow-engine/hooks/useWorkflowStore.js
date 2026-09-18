import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createEmptyWorkflow, createLocalId } from '../core/workflowDomainModel'

/**
 * Local-only workflow persistence (Zustand + persist, same convention as
 * src/store/authStore.js). This is a REAL, honest save — it survives
 * reloads on this browser — but it is NOT a backend save: nothing here
 * talks to an API, because no workflow persistence API exists yet (see
 * docs/WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md). Every surface that shows
 * a saved workflow must label it as local-only; see
 * components/WorkflowLocalStorageNotice.jsx.
 */
export const useWorkflowStore = create(
  persist(
    (set, get) => ({
      workflows: {},

      list: () =>
        Object.values(get().workflows).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),

      getById: (id) => get().workflows[id] || null,

      create: (context, overrides = {}) => {
        const id = createLocalId('wf')
        const workflow = { ...createEmptyWorkflow(context), ...overrides, id }
        set((state) => ({ workflows: { ...state.workflows, [id]: workflow } }))
        return workflow
      },

      save: (workflow) => {
        const id = workflow.id || createLocalId('wf')
        const next = { ...workflow, id, updatedAt: new Date().toISOString() }
        set((state) => ({ workflows: { ...state.workflows, [id]: next } }))
        return next
      },

      setStatus: (id, status) =>
        set((state) => {
          const workflow = state.workflows[id]
          if (!workflow) return state
          return { workflows: { ...state.workflows, [id]: { ...workflow, status, updatedAt: new Date().toISOString() } } }
        }),

      remove: (id) =>
        set((state) => {
          const next = { ...state.workflows }
          delete next[id]
          return { workflows: next }
        }),

      duplicate: (id) => {
        const source = get().workflows[id]
        if (!source) return null
        const newId = createLocalId('wf')
        const now = new Date().toISOString()
        const copy = { ...source, id: newId, name: `${source.name} (Copy)`, status: 'draft', createdAt: now, updatedAt: now }
        set((state) => ({ workflows: { ...state.workflows, [newId]: copy } }))
        return copy
      },
    }),
    { name: 'ican-workflow-drafts', version: 1 }
  )
)

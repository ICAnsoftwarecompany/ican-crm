import { useState } from 'react'
import { toast } from 'sonner'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { Tabs } from '../../shared/components/ui/Tabs'
import { VisualFlow, VISUAL_FLOW_MODES } from '../../shared/components/visual-flow'
import {
  demoWorkflowNodeRegistry,
  demoEdgeRegistry,
  demoWorkflowNodes,
  demoWorkflowEdges,
  approvalProcessRegistry,
  approvalProcessNodes,
  approvalProcessEdges,
  leadJourneyRegistry,
  leadJourneyNodes,
  leadJourneyEdges,
  opportunityJourneyRegistry,
  opportunityJourneyNodes,
  opportunityJourneyEdges,
  demoExecutionState,
} from './visualFlowDemoData'
import { resolveDemoIcon } from './visualFlowDemoIcons'

/**
 * Proves VisualFlow is domain-agnostic (see docs "Final Acceptance Test"):
 * every tab below renders through the exact same <VisualFlow> component,
 * only `nodes`/`edges`/`nodeRegistry`/`mode` change.
 */
export function VisualFlowDemo() {
  const [activeTab, setActiveTab] = useState('editor')
  const [workflowNodes, setWorkflowNodes] = useState(demoWorkflowNodes)
  const [workflowEdges, setWorkflowEdges] = useState(demoWorkflowEdges)

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <PageToolbar title="VisualFlow Playground" description="One shared framework — Workflow editing, readonly process visualization, live execution, and entity journeys, all using <VisualFlow>." />

      <div className="min-h-0 flex-1">
        <Tabs
          variant="underline"
          active={activeTab}
          onChange={setActiveTab}
          items={[
            {
              id: 'editor',
              label: 'Workflow Editor',
              content: (
                <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl border border-[var(--border)]">
                  <VisualFlow
                    mode={VISUAL_FLOW_MODES.EDIT}
                    nodes={workflowNodes}
                    edges={workflowEdges}
                    onNodesChange={setWorkflowNodes}
                    onEdgesChange={setWorkflowEdges}
                    nodeRegistry={demoWorkflowNodeRegistry}
                    edgeRegistry={demoEdgeRegistry}
                    resolveIcon={resolveDemoIcon}
                    toolbar={{ undo: true, redo: true, layout: true, validate: true, minimap: true, save: true }}
                    onSave={() => toast.success('Flow saved (demo — not persisted anywhere)')}
                  />
                </div>
              ),
            },
            {
              id: 'readonly',
              label: 'Readonly Flow',
              content: (
                <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl border border-[var(--border)]">
                  <VisualFlow
                    mode={VISUAL_FLOW_MODES.READONLY}
                    defaultNodes={approvalProcessNodes}
                    defaultEdges={approvalProcessEdges}
                    nodeRegistry={approvalProcessRegistry}
                    resolveIcon={resolveDemoIcon}
                    onNodeClick={(_event, node) => toast.info(`${node.data.label}${node.data.summary ? ` — ${node.data.summary}` : ''}`)}
                  />
                </div>
              ),
            },
            {
              id: 'live',
              label: 'Live Execution',
              content: (
                <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl border border-[var(--border)]">
                  <VisualFlow
                    mode={VISUAL_FLOW_MODES.LIVE}
                    defaultNodes={demoWorkflowNodes}
                    defaultEdges={demoWorkflowEdges}
                    nodeRegistry={demoWorkflowNodeRegistry}
                    edgeRegistry={demoEdgeRegistry}
                    resolveIcon={resolveDemoIcon}
                    executionState={demoExecutionState}
                  />
                </div>
              ),
            },
            {
              id: 'lead-journey',
              label: 'Lead Journey',
              content: (
                <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl border border-[var(--border)]">
                  <VisualFlow
                    mode={VISUAL_FLOW_MODES.READONLY}
                    defaultNodes={leadJourneyNodes}
                    defaultEdges={leadJourneyEdges}
                    nodeRegistry={leadJourneyRegistry}
                    resolveIcon={resolveDemoIcon}
                    onNodeClick={(_event, node) => toast.info(node.data.label)}
                  />
                </div>
              ),
            },
            {
              id: 'opportunity-journey',
              label: 'Opportunity Journey',
              content: (
                <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl border border-[var(--border)]">
                  <VisualFlow
                    mode={VISUAL_FLOW_MODES.READONLY}
                    defaultNodes={opportunityJourneyNodes}
                    defaultEdges={opportunityJourneyEdges}
                    nodeRegistry={opportunityJourneyRegistry}
                    resolveIcon={resolveDemoIcon}
                    onNodeClick={(_event, node) => toast.info(`${node.data.label}${node.data.summary ? ` — ${node.data.summary}` : ''}`)}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

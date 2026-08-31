import { Navigate, useParams } from 'react-router-dom'

import { ProposalBuilder } from './components/ProposalBuilder'

export function CustomerProposalBuilderPage() {
  const { proposalId } = useParams()

  if (!proposalId) return <Navigate to="/customers/proposals" replace />

  return <ProposalBuilder proposalId={proposalId} />
}

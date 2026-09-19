import { CheckSquare, CircleDot, Database, Flag, GitBranch, Play, Sparkles, UserCheck, Users, Zap } from 'lucide-react'

const ICONS = { CheckSquare, CircleDot, Database, Flag, GitBranch, Group: Users, Play, Sparkles, UserCheck, Zap }

/** Passed to <VisualFlow resolveIcon={...} /> — VisualFlow core never imports lucide-react itself, see BaseNode.jsx. */
export function resolveDemoIcon(name) {
  return ICONS[name] || null
}

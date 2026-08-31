export const AI_PERMISSION_LEVELS = {
  AUTO_APPROVE: 'auto_approve',
  REQUIRE_APPROVAL: 'require_approval',
  NEVER_ALLOW: 'never_allow',
}

export const AI_ACTION_PERMISSIONS = {
  'lead.tag': AI_PERMISSION_LEVELS.AUTO_APPROVE,
  'lead.note': AI_PERMISSION_LEVELS.AUTO_APPROVE,
  'insight.generate': AI_PERMISSION_LEVELS.AUTO_APPROVE,
  'message.suggest': AI_PERMISSION_LEVELS.AUTO_APPROVE,
  'lead.assign': AI_PERMISSION_LEVELS.REQUIRE_APPROVAL,
  'lead.status_change': AI_PERMISSION_LEVELS.REQUIRE_APPROVAL,
  'message.send': AI_PERMISSION_LEVELS.REQUIRE_APPROVAL,
  'campaign.pause': AI_PERMISSION_LEVELS.REQUIRE_APPROVAL,
  'lead.delete': AI_PERMISSION_LEVELS.NEVER_ALLOW,
  'customer.delete': AI_PERMISSION_LEVELS.NEVER_ALLOW,
  'campaign.delete': AI_PERMISSION_LEVELS.NEVER_ALLOW,
}

export function getAiPermission(action) {
  return AI_ACTION_PERMISSIONS[action] || AI_PERMISSION_LEVELS.REQUIRE_APPROVAL
}

export function canAutoRunAiAction(action) {
  return getAiPermission(action) === AI_PERMISSION_LEVELS.AUTO_APPROVE
}

export function requiresAiApproval(action) {
  return getAiPermission(action) === AI_PERMISSION_LEVELS.REQUIRE_APPROVAL
}

export function isAiActionBlocked(action) {
  return getAiPermission(action) === AI_PERMISSION_LEVELS.NEVER_ALLOW
}

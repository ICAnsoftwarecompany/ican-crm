function getRole(conversation, userId) {
  const members = Array.isArray(conversation?.users) ? conversation.users : []
  const found = members.find((member) => String(member?.id ?? member?.user_id ?? member?.userId) === String(userId || ''))
  return String(found?.pivot?.role || found?.role || 'member').toLowerCase()
}

export function useChatPermissions(conversation, currentUserId) {
  const role = getRole(conversation, currentUserId)
  const isOwner = role === 'owner'
  const isAdmin = role === 'admin'

  return {
    role,
    canSendMessage: true,
    canAddMembers: isOwner || isAdmin,
    canRemoveMembers: isOwner || isAdmin,
    canManageRoles: isOwner,
    canRenameGroup: isOwner || isAdmin,
    canMuteConversation: true,
  }
}

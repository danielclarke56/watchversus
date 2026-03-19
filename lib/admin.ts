export function checkAdmin(userId: string): boolean {
  const ids = process.env.ADMIN_USER_IDS?.split(',').map((s) => s.trim()) ?? []
  // Backwards-compatible: also check legacy single ADMIN_USER_ID
  const legacyId = process.env.ADMIN_USER_ID
  if (legacyId) ids.push(legacyId.trim())
  return ids.includes(userId)
}

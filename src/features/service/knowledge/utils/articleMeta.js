export const ARTICLE_STATUSES = ['draft', 'published', 'archived']
export const ARTICLE_VISIBILITIES = ['internal', 'agent', 'customer', 'public']
export const ARTICLE_LANGUAGES = ['ar', 'en']

/** Status → shared status color token (Tailwind `status.*`). */
export const ARTICLE_STATUS_TONE = {
  draft: 'bg-status-contacted',
  published: 'bg-status-won',
  archived: 'bg-[var(--text-muted)]',
}

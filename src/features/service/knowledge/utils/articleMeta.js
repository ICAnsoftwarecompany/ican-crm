export const ARTICLE_STATUSES = ['draft', 'review', 'published', 'archived']
/** Extra list views served by the API (`status=`): waiting review, expiring/expired, unpublished edits. */
export const ARTICLE_VIEWS = ['changes', 'expiring']
export const ARTICLE_VISIBILITIES = ['internal', 'agent', 'customer', 'public']
export const ARTICLE_LANGUAGES = ['ar', 'en']
export const ARTICLE_TYPES = ['article', 'faq', 'troubleshooting', 'procedure', 'script', 'guide']

/** Status → shared status color token (Tailwind `status.*`). */
export const ARTICLE_STATUS_TONE = {
  draft: 'bg-status-contacted',
  review: 'bg-sla-at-risk',
  published: 'bg-status-won',
  archived: 'bg-[var(--text-muted)]',
}

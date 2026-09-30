# features/service/knowledge — Knowledge base (F2)

Internal knowledge base at `/service/knowledge` (list) and `/service/knowledge/:articleId` (`new` creates).
Articles are suggested on cases. The customer portal (F5) will show `customer`/`public` articles only;
AI answers (F7) use **published, non-expired** articles only.

| Path | Role |
|---|---|
| `api/knowledgeApi.js` | CRUD `/service/kb/articles`, `POST …/{id}/publish`, `GET /service/cases/{id}/suggested-articles`; hooks `useKbArticles`, `useKbArticle`, `useSuggestedArticles`, `useKbMutations`. |
| `components/KnowledgeWorkspace.jsx` | Search + category/status filters + list. |
| `components/ArticleEditor.jsx` | Title/content + category, language, visibility, related request types, tags; save, save & publish, preview, archive, delete. |
| `components/ArticleReader.jsx` | Read-only view (plain text, line breaks kept) used in drawers and preview. |
| `components/SuggestedArticlesPanel.jsx` | Case side panel; opens an article in a drawer. |
| `components/ArticleWorkflowActions.jsx` | F6: draft → send for review / publish now; review → approve & publish / send back (note); archive / restore. |
| `components/ArticleVersionsDrawer.jsx` | F6: version history (live + working copy marked), view any version, restore (= new version). |
| `components/KnowledgeStats.jsx` | F6: live articles, views, helpful rate, requests avoided (deflections), searches with no answer (content gaps). |
| `utils/articleMeta.js` | Status/visibility/language lists and status colors. |

Article: `{ id, category_id, category: {id,label}, title, body, language, visibility:
internal|agent|customer|public, status: draft|published|archived, tags[], related_case_type_ids[],
version, published_at, expires_at?, updated_at }`.

## F6 — versions, review, self-service

- Every title/body change is a **new version** (`versions[]`); `published_version` is what the portal, suggestions and
  AI read. Editing a published article moves it to `draft` while the published version stays live
  (`has_unpublished_changes`). Archived and expired (`expires_at`) articles are never served.
- Workflow: `POST …/{id}/submit-review { reviewer_id? }` (draft → review), `POST …/{id}/reject { note }` (review → draft
  with `review_note`), `POST …/{id}/publish`, `POST …/{id}/archive`, `POST …/{id}/unarchive`,
  `GET …/{id}/versions/{v}`, `POST …/{id}/versions/{v}/restore`. List adds `type`, views `status=changes|expiring` and
  `meta.counts`. `GET /service/kb/stats` feeds the stats strip. All proposed additions to spec §41 (409 `KB_INVALID_STATUS`).
- Types: article, faq, troubleshooting, procedure, script, guide.
- Portal (`features/portal`): signed-in help center shows `customer` + `public`; the **public help center**
  `/portal/help-center` (no sign-in, tenant switch `public_help_center`) shows `public` only; "Was this helpful?" votes;
  while writing a new request the portal suggests answers and "This solved it" records a deflection. Portal searches
  with no result are logged as content gaps. Fixed: the F5 portal list used the *category* visibility and could show
  agent/internal articles placed in a customer category.

Rules: creating always yields a **draft**; publishing is a separate call (server permission `kb.publish`).
Article title/body are content in the article's own language — render with `lang` + `bdi`/`dir="auto"`,
never through `t()`. Categories are managed in settings (`/service/settings/kb-categories`); deleting a
category with articles returns 409 `RESOURCE_IN_USE`.

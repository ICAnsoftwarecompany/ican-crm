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
| `utils/articleMeta.js` | Status/visibility/language lists and status colors. |

Article: `{ id, category_id, category: {id,label}, title, body, language, visibility:
internal|agent|customer|public, status: draft|published|archived, tags[], related_case_type_ids[],
version, published_at, expires_at?, updated_at }`.

Rules: creating always yields a **draft**; publishing is a separate call (server permission `kb.publish`).
Article title/body are content in the article's own language — render with `lang` + `bdi`/`dir="auto"`,
never through `t()`. Categories are managed in settings (`/service/settings/kb-categories`); deleting a
category with articles returns 409 `RESOURCE_IN_USE`.

# features/service/search — Global service search (F6)

`ServiceSearch.jsx` is a combobox in the Operations Center header. It calls `GET /service/search?q=`
(debounced; at least 2 characters) and gets back groups: **cases** (number / subject), **customers**
(name / phone), **records**, and **knowledge articles**. The search matches the current UI language. Picking
a result opens the case, the customer drawer, the record, or the article. Keyboard: ↑/↓/Enter/Esc.

The server owns the search: ranking, permissions, and tenant scoping. The mock uses `matchesSearch` over the
in-memory collections.

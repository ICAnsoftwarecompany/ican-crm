// Column definition type
export const ColumnDefinition = {
  id: String,           // Unique column identifier
  header: String,       // Display header text
  accessor: String,     // Object key path (dot notation supported)
  searchable: Boolean,  // Include in global search
  sortable: Boolean,    // Allow sorting
  visible: Boolean,     // Initially visible
  width: String,        // Tailwind width class or pixel value
  pinned: Boolean,      // Initially pinned to left
  render: Function,     // Optional custom render (row) => ReactNode
}

// Sorting state
export const SortingState = {
  column: String,       // Column ID to sort by
  direction: String,    // 'asc' or 'desc'
}

// Pagination state
export const PaginationState = {
  pageIndex: Number,    // 0-based page number
  pageSize: Number,     // Rows per page
}

// DataTable state shape
export const DataTableState = {
  sorting: SortingState,
  pagination: PaginationState,
  columnVisibility: Object, // { columnId: boolean, ... }
  pinnedColumns: Object,    // { columnId: boolean, ... }
  columnWidths: Object,     // { columnId: widthPx, ... }
  globalFilter: String,  // Global search term
}

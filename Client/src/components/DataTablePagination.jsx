export const TablePagination = ({ table }) => {
  const currentPage = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between text-sm text-gray-600 px-5">
      <span>
        Page {currentPage + 1} of {pageCount}
        {" "}· {table.getFilteredRowModel().rows.length} total results
      </span>

      <div className="flex items-center gap-1">
        <button onClick={() => table.setPageIndex(0)}             disabled={!table.getCanPreviousPage()} className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">«</button>
        <button onClick={() => table.previousPage()}              disabled={!table.getCanPreviousPage()} className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">‹</button>

        {Array.from({ length: pageCount }, (_, i) => i)
          .filter(page => page === 0 || page === pageCount - 1 || Math.abs(page - currentPage) <= 1)
          .reduce((acc, page, idx, arr) => {
            if (idx > 0 && page - arr[idx - 1] > 1) acc.push("...");
            acc.push(page);
            return acc;
          }, [])
          .map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => table.setPageIndex(page)}
                className={`px-3 py-1 rounded border transition-colors
                  ${currentPage === page
                    ? "bg-primary text-white border-primary"
                    : "border-gray-200 hover:bg-gray-50"}`}
              >
                {page + 1}
              </button>
            )
          )
        }

        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">›</button>
        <button onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()} className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">»</button>
      </div>
    </div>
  );
};
export function ListingPagination({
  page,
  pages,
  onChange,
}: {
  page: number
  pages: number
  onChange: (page: number) => void
}) {
  if (pages <= 1) return null
  return (
    <nav className="listing-pagination" aria-label="Stranice oglasa">
      <button className="btn btn-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prethodna
      </button>
      <span>
        Stranica {page} od {pages}
      </span>
      <button className="btn btn-outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Sljedeća
      </button>
    </nav>
  )
}

import UiIcon from "./UiIcon";

type PaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  rangeEnd: number;
  rangeStart: number;
  totalItems: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  onPageChange,
  pageSize,
  rangeEnd,
  rangeStart,
  totalItems,
  totalPages,
}: PaginationProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Paginação de tickets">
      <span className="pagination-summary">
        {rangeStart}–{rangeEnd} de {totalItems}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <UiIcon name="chevron-left" />
        </button>
        <span aria-current="page">
          Página {currentPage} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
        >
          <UiIcon name="chevron-right" />
        </button>
      </div>
    </nav>
  );
}

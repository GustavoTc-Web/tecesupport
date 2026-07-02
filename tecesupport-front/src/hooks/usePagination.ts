import { useMemo, useState } from "react";

export default function usePagination<T>(items: T[], pageSize: number) {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  function goToPage(page: number) {
    setRequestedPage(Math.min(Math.max(page, 1), totalPages));
  }

  return {
    currentPage,
    goToPage,
    pageItems,
    rangeEnd,
    rangeStart,
    totalItems,
    totalPages,
  };
}

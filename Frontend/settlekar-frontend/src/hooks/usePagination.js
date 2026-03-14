import { useState, useCallback } from 'react';

export function usePagination(initialSize = 10) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const updateFromResponse = useCallback((data) => {
    setTotalPages(data.totalPages || 0);
    setTotalElements(data.totalElements || 0);
  }, []);

  const reset = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    size,
    totalPages,
    totalElements,
    setPage,
    setSize,
    updateFromResponse,
    reset,
  };
}

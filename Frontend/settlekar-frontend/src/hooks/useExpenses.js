import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getExpenses } from '../api/expenses';
import { usePagination } from './usePagination';

export function useExpenses(groupId, { sortBy = 'createdAt', direction = 'DESC' } = {}) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pagination = usePagination(10);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getExpenses(groupId, {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        direction,
      });
      setExpenses(res.data.content || []);
      pagination.updateFromResponse(res.data);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, pagination.page, pagination.size, sortBy, direction]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { expenses, isLoading, error, pagination, refetch: fetch };
}

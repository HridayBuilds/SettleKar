import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getOptimizedSettlements, getSettlements } from '../api/settlements';
import { usePagination } from './usePagination';

export function useSettlements(groupId) {
  const [settlements, setSettlements] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pagination = usePagination(10);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [settlementsRes, suggestionsRes] = await Promise.all([
        getSettlements(groupId, pagination.page, pagination.size),
        getOptimizedSettlements(groupId),
      ]);
      setSettlements(settlementsRes.data.content || []);
      pagination.updateFromResponse(settlementsRes.data);
      setSuggestions(suggestionsRes.data || []);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to load settlements');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, pagination.page, pagination.size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { settlements, suggestions, isLoading, error, pagination, refetch: fetch };
}

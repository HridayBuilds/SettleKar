import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getGroups } from '../api/groups';
import { usePagination } from './usePagination';

export function useGroups() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pagination = usePagination(12);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getGroups(pagination.page, pagination.size);
      setGroups(res.data.content || []);
      pagination.updateFromResponse(res.data);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { groups, isLoading, error, pagination, refetch: fetch };
}

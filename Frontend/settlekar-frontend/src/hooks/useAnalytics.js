import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getCategoryAnalytics, getMonthlyAnalytics, getMemberAnalytics } from '../api/analytics';

export function useAnalytics(groupId) {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [catRes, monthRes, memRes] = await Promise.all([
        getCategoryAnalytics(groupId),
        getMonthlyAnalytics(groupId),
        getMemberAnalytics(groupId),
      ]);
      setCategoryData(catRes.data || []);
      setMonthlyData(monthRes.data || []);
      setMemberData(memRes.data || []);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categoryData, monthlyData, memberData, isLoading, error, refetch: fetch };
}

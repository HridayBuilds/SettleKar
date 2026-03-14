import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getPairwiseBalances, getBalanceSummary, getDebtGraph } from '../api/balances';

export function useBalances(groupId) {
  const [pairwise, setPairwise] = useState([]);
  const [summary, setSummary] = useState([]);
  const [graph, setGraph] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [pairRes, summaryRes, graphRes] = await Promise.all([
        getPairwiseBalances(groupId),
        getBalanceSummary(groupId),
        getDebtGraph(groupId),
      ]);
      setPairwise(pairRes.data || []);
      setSummary(summaryRes.data || []);
      setGraph(graphRes.data || null);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to load balances');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { pairwise, summary, graph, isLoading, error, refetch: fetch };
}

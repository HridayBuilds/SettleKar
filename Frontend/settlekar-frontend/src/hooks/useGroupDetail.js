import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getGroup, getMembers } from '../api/groups';

export function useGroupDetail(groupId) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [groupRes, membersRes] = await Promise.all([
        getGroup(groupId),
        getMembers(groupId),
      ]);
      setGroup(groupRes.data);
      setMembers(membersRes.data || []);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to load group');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { group, members, isLoading, error, refetch: fetch };
}

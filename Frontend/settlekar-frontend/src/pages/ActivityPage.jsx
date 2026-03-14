import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { useGroups } from '../hooks/useGroups';
import { getLedger } from '../api/groups';

const PAGE_SIZE = 20;

export default function ActivityPage() {
  const { groups, isLoading: groupsLoading } = useGroups();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const fetchEntries = useCallback(
    async (pageNum = 0, append = false) => {
      if (groups.length === 0) return;

      setIsLoading(true);
      try {
        const promises = groups.map((g) =>
          getLedger(g.id, 0, 50).catch(() => ({ data: { content: [] } }))
        );
        const results = await Promise.all(promises);

        let allEntries = [];
        results.forEach((res) => {
          const content = res.data?.content || [];
          allEntries = allEntries.concat(content);
        });

        allEntries.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const start = 0;
        const end = (pageNum + 1) * PAGE_SIZE;
        const sliced = allEntries.slice(start, end);

        if (append) {
          setEntries((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newEntries = sliced.filter((e) => !existingIds.has(e.id));
            return [...prev, ...newEntries];
          });
        } else {
          setEntries(sliced);
        }

        setHasMore(end < allEntries.length);
        setInitialLoaded(true);
      } catch (err) {
        toast.error('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    },
    [groups]
  );

  useEffect(() => {
    if (!groupsLoading && groups.length > 0) {
      fetchEntries(0);
    } else if (!groupsLoading && groups.length === 0) {
      setInitialLoaded(true);
    }
  }, [groupsLoading, groups, fetchEntries]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntries(nextPage, true);
  };

  if (groupsLoading || (!initialLoaded && isLoading)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Activity</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track all actions across your groups
        </p>
      </div>

      <ActivityFeed
        entries={entries}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { useGroups } from '../hooks/useGroups';
import { joinGroupByCode } from '../api/groups';

export default function GroupsPage() {
  const { groups, isLoading, pagination, refetch } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinCode: urlJoinCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlJoinCode) {
      handleJoinByCode(urlJoinCode);
    }
  }, [urlJoinCode]);

  const handleJoinByCode = async (code) => {
    const codeToUse = code || joinCode.trim();
    if (!codeToUse) {
      toast.error('Please enter a join code');
      return;
    }
    setIsJoining(true);
    try {
      const res = await joinGroupByCode(codeToUse);
      toast.success(`Joined group "${res.data.name}" successfully!`);
      setJoinCode('');
      refetch();
      if (res.data.id) {
        navigate(`/groups/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">My Groups</h1>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>
          Create Group
        </Button>
      </div>

      {/* Join by code */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-4">
        <span className="text-sm font-medium text-text-secondary whitespace-nowrap">Join a Group:</span>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter join code"
          maxLength={8}
          className="h-9 flex-1 rounded border border-border bg-bg-page px-3 font-mono text-sm tracking-wider text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <Button
          size="sm"
          icon={LogIn}
          onClick={() => handleJoinByCode()}
          isLoading={isJoining}
          disabled={!joinCode.trim()}
        >
          Join
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          subtitle="Create your first group or join one with a code"
          actionLabel="Create Group"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <CreateGroupModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

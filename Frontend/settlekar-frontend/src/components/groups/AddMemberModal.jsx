import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { SearchInput } from '../ui/SearchInput';
import { Avatar } from '../ui/Avatar';
import { Spinner } from '../ui/Spinner';
import { searchUsers } from '../../api/users';
import { addMember } from '../../api/groups';
import { useDebounce } from '../../hooks/useDebounce';

export function AddMemberModal({ isOpen, onClose, groupId, onSuccess }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    async function search() {
      setIsSearching(true);
      try {
        const res = await searchUsers(debouncedQuery);
        setResults(res.data.content || res.data || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    search();
  }, [debouncedQuery]);

  const handleSelect = async (user) => {
    setIsAdding(true);
    try {
      await addMember(groupId, user.username);
      toast.success(`${user.firstName} added to group`);
      setQuery('');
      setResults([]);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Member">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by username..."
        delay={0}
      />

      <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
        {isSearching && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {!isSearching && results.length === 0 && debouncedQuery.length >= 2 && (
          <p className="py-4 text-center text-sm text-text-muted">
            No users found
          </p>
        )}

        {!isSearching &&
          results.map((user) => (
            <button
              key={user.id || user.username}
              onClick={() => handleSelect(user)}
              disabled={isAdding}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-bg-elevated disabled:opacity-50"
            >
              <Avatar
                firstName={user.firstName}
                lastName={user.lastName}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-text-muted">
                  @{user.username}
                </p>
              </div>
            </button>
          ))}
      </div>
    </Modal>
  );
}

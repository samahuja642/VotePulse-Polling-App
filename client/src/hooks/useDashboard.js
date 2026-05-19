import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';

export default function useDashboard() {
  const [polls, setPolls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPolls = useCallback(async (p) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/polls/me', { params: { page: p, limit: 10 } });
      setPolls(res.data.data.polls);
      setPagination(res.data.data.pagination);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to load your polls';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls(page);
  }, [page, fetchPolls]);

  const toggleStatus = useCallback(async (pollId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    setActionLoading(pollId);
    try {
      await api.patch(`/polls/${pollId}`, { status: newStatus });
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, status: newStatus } : p)),
      );
      toast.success(`Poll ${newStatus === 'closed' ? 'closed' : 'reopened'}`);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to update poll';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const deletePoll = useCallback(async (pollId) => {
    setActionLoading(pollId);
    try {
      await api.delete(`/polls/${pollId}`);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      toast.success('Poll deleted');
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to delete poll';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }, []);

  return {
    polls,
    pagination,
    page,
    loading,
    error,
    actionLoading,
    setPage,
    toggleStatus,
    deletePoll,
    retry: () => fetchPolls(page),
  };
}

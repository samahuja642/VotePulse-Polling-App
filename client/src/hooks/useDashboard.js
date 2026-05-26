import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';

export default function useDashboard() {
  const [polls, setPolls] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const debounceRef = useRef(null);
  const observerRef = useRef(null);

  const fetchPolls = useCallback(async (p, q, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = { page: p, limit: 10 };
      if (q) params.search = q;
      const res = await api.get('/polls/me', { params });
      const { polls: newPolls, pagination } = res.data.data;

      setPolls((prev) => (append ? [...prev, ...newPolls] : newPolls));
      setHasMore(pagination.page < pagination.pages);
      setPage(p);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to load your polls';
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPolls(1, search);
  }, []);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchPolls(1, value);
    }, 400);
  }, [fetchPolls]);

  // Load more (called by intersection observer)
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchPolls(page + 1, search, true);
  }, [page, search, hasMore, loadingMore, fetchPolls]);

  // Intersection observer ref callback for sentinel element
  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            loadMore();
          }
        },
        { rootMargin: '200px' },
      );
      observerRef.current.observe(node);
    },
    [hasMore, loadingMore, loadMore],
  );

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
    loading,
    loadingMore,
    error,
    search,
    hasMore,
    actionLoading,
    handleSearch,
    sentinelRef,
    toggleStatus,
    deletePoll,
    retry: () => fetchPolls(1, search),
  };
}

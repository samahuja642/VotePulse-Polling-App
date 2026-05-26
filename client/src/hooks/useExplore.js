import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';

export default function useExplore() {
  const [polls, setPolls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const fetchPolls = useCallback(async (p, s, q) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: p, limit: 10, sort: s };
      if (q) params.search = q;
      const res = await api.get('/polls/public', { params });
      setPolls(res.data.data.polls);
      setPagination(res.data.data.pagination);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to load polls';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls(page, sort, search);
  }, [page, sort, fetchPolls]);

  // Debounced search — resets to page 1
  const handleSearch = useCallback((value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPolls(1, sort, value);
    }, 400);
  }, [sort, fetchPolls]);

  const handleSort = useCallback((value) => {
    setSort(value);
    setPage(1);
  }, []);

  return {
    polls,
    pagination,
    page,
    sort,
    search,
    loading,
    error,
    setPage,
    handleSort,
    handleSearch,
    retry: () => fetchPolls(page, sort, search),
  };
}

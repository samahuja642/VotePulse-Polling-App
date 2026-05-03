import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { connectSocket } from '../lib/socket.js';

export default function usePollDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [existingVote, setExistingVote] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);

  const isOwner = user && poll && user.id === poll.creator_id;
  const canSeeResults = isOwner || poll?.show_results;
  const hasVoted = !!existingVote;
  const isClosed = poll?.status === 'closed';
  const isExpired = poll?.expires_at && new Date(poll.expires_at) <= new Date();
  const canVote = !hasVoted && !isClosed && !isExpired;

  // Fetch poll + check existing vote + fetch results if allowed
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const pollRes = await api.get(`/polls/${id}`);
        const pollData = pollRes.data.data;
        setPoll(pollData);

        const isCreator = user && user.id === pollData.creator_id;

        // Run vote-check and results fetch in parallel where possible
        await Promise.all([
          // Check if authenticated user already voted
          user
            ? api
                .get(`/polls/${id}/vote`)
                .then((res) => {
                  if (res.data.data.voted) setExistingVote(res.data.data.vote);
                })
                .catch(() => {})
            : Promise.resolve(),

          // Fetch results if owner or show_results enabled
          isCreator || pollData.show_results
            ? api
                .get(`/polls/${id}/results`)
                .then((res) => setResults(res.data.data))
                .catch(() => {})
            : Promise.resolve(),
        ]);
      } catch (err) {
        const message = err.response?.data?.error?.message || 'Failed to load poll';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  // Real-time vote updates via Socket.io
  useEffect(() => {
    const socket = connectSocket();
    socket.emit('join:poll', id);
    socket.on('vote:new', ({ results: updated }) => setResults(updated));

    return () => {
      socket.emit('leave:poll', id);
      socket.off('vote:new');
      // Don't disconnect the global socket — other pages may reconnect to it
    };
  }, [id]);

  const toggleOption = useCallback(
    (optionId) => {
      if (!canVote) return;
      if (poll?.multi_vote) {
        setSelected((prev) =>
          prev.includes(optionId) ? prev.filter((i) => i !== optionId) : [...prev, optionId],
        );
      } else {
        setSelected([optionId]);
      }
    },
    [canVote, poll?.multi_vote],
  );

  const submitVote = useCallback(async () => {
    if (selected.length === 0) {
      toast.error('Please select an option');
      return;
    }

    setVoting(true);
    try {
      const res = await api.post(`/polls/${id}/vote`, { option_id: selected[0] });
      const { vote, results: newResults } = res.data.data;

      setExistingVote(vote);
      setResults(newResults);
      setSelected([]);
      toast.success('Vote cast!');
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to cast vote';
      toast.error(message);
    } finally {
      setVoting(false);
    }
  }, [id, selected]);

  return {
    poll,
    results,
    existingVote,
    selected,
    loading,
    voting,
    error,
    isOwner,
    canSeeResults,
    hasVoted,
    canVote,
    isClosed,
    isExpired,
    toggleOption,
    submitVote,
  };
}

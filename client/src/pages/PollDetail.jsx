import { Link } from 'react-router-dom';
import { CircleNotch, WarningCircle, CheckCircle, ArrowLeft } from '@phosphor-icons/react';
import usePollDetail from '../hooks/usePollDetail.js';
import { useAuth } from '../context/AuthContext.jsx';
import PollHeader from '../components/poll/PollHeader.jsx';
import PollOptions from '../components/poll/PollOptions.jsx';
import ShareQRCard from '../components/poll/ShareQRCard.jsx';

export default function PollDetail() {
  const { user } = useAuth();
  const {
    poll,
    results,
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
    existingVote,
    toggleOption,
    submitVote,
  } = usePollDetail();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <CircleNotch size={32} className="animate-spin" style={{ color: 'var(--color-primary-400)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <WarningCircle size={40} weight="fill" style={{ color: 'var(--color-danger-500)' }} />
        <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
          {error}
        </p>
        <Link
          to="/"
          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <Link
          to={user ? '/dashboard' : '/'}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ArrowLeft size={13} /> {user ? 'Back to Dashboard' : 'Back to Home'}
        </Link>

        <PollHeader poll={poll} isOwner={isOwner} isClosed={isClosed} isExpired={isExpired} />

        {hasVoted && (
          <div
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-success-500) 12%, var(--surface))',
              color: 'var(--color-success-600)',
              border: '1px solid color-mix(in srgb, var(--color-success-500) 25%, var(--border))',
            }}
          >
            <CheckCircle size={16} weight="fill" />
            You have already voted on this poll.
          </div>
        )}

        {canVote && (
          <PollOptions
            mode="vote"
            options={poll.options}
            multiVote={poll.multi_vote}
            selected={selected}
            voting={voting}
            onToggle={toggleOption}
            onSubmit={submitVote}
          />
        )}

        {!canVote && (
          <PollOptions
            mode={canSeeResults && results ? 'results' : 'readonly'}
            options={poll.options}
            results={results}
            votedOptionIds={existingVote?.map((v) => v.option_id)}
            message={!hasVoted && (isClosed || isExpired) ? 'This poll is no longer accepting votes.' : undefined}
          />
        )}

        <ShareQRCard poll={poll} />
      </div>
    </div>
  );
}

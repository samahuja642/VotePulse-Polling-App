import { ChartBar, CheckCircle } from '@phosphor-icons/react';
import Button from '../ui/Button.jsx';
import Section from '../ui/Section.jsx';
import ResultsChart from '../charts/ResultsChart.jsx';

/* ── Sub-components ── */

function VoteOptions({ options, multiVote, selected, voting, onToggle, onSubmit }) {
  return (
    <Section heading={multiVote ? 'Select one or more options' : 'Select an option'}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
            style={{
              border: `1px solid ${isSelected ? 'var(--ring)' : 'var(--border)'}`,
              backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
            }}
            onClick={() => onToggle(option.id)}
          >
            <input
              type={multiVote ? 'checkbox' : 'radio'}
              name="poll-option"
              checked={isSelected}
              onChange={() => onToggle(option.id)}
              className="h-4 w-4 shrink-0 accent-primary-600"
            />
            <span className="text-sm" style={{ color: 'var(--text)' }}>
              {option.text}
            </span>
          </label>
        );
      })}

      <Button
        onClick={onSubmit}
        loading={voting}
        loadingText="Submitting..."
        disabled={selected.length === 0}
        icon={ChartBar}
      >
        Submit Vote
      </Button>
    </Section>
  );
}

function ResultOptions({ results }) {
  const total = results.reduce((sum, r) => sum + r.count, 0);

  return (
    <Section
      heading="Results"
      trailing={
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary-500) 12%, var(--surface))',
            color: 'var(--color-primary-600)',
          }}
        >
          {total} vote{total !== 1 ? 's' : ''}
        </span>
      }
    >
      {/* Bar chart — hidden on small screens */}
      {total > 0 && (
        <div className="hidden sm:block">
          <ResultsChart results={results} />
        </div>
      )}

      {/* Percentage breakdown list — always visible */}
      <div className="space-y-3">
        {results.map((option) => {
          const pct = total > 0 ? Math.round((option.count / total) * 100) : 0;
          return (
            <div key={option.option_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text)' }}>{option.text}</span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {option.count} ({pct}%)
                </span>
              </div>
              <div
                className="h-2.5 w-full rounded-full"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <div
                  className="h-2.5 rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ReadonlyOptions({ options, votedOptionIds, message }) {
  return (
    <Section heading="Options">
      {options.map((option) => (
        <div
          key={option.id}
          className="flex items-center gap-3 rounded-lg p-3"
          style={{ border: '1px solid var(--border)' }}
        >
          {votedOptionIds?.includes(option.id) && (
            <CheckCircle size={16} weight="fill" className="shrink-0" style={{ color: 'var(--color-primary-400)' }} />
          )}
          <span className="text-sm" style={{ color: 'var(--text)' }}>
            {option.text}
          </span>
        </div>
      ))}

      {message && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {message}
        </p>
      )}
    </Section>
  );
}

/* ── Public API ── */

const views = { vote: VoteOptions, results: ResultOptions, readonly: ReadonlyOptions };

export default function PollOptions({ mode, ...props }) {
  const View = views[mode];
  return <View {...props} />;
}

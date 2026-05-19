import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ResultsChart({ results }) {
  const data = results.map((r) => ({
    name: r.text,
    votes: r.count,
    percentage: r.percentage,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const { name, votes, percentage } = payload[0].payload;
      return (
        <div
          className="rounded-md p-2"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{name}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {votes} vote{votes !== 1 ? 's' : ''} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="votes" fill="var(--color-primary-500)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

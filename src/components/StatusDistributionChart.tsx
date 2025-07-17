import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface StatusDistributionChartProps {
  data?: Record<string, number>
}

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const COLORS = {
    'needs_processing': '#9CA3AF',
    'processing': '#3B82F6',
    'approved': '#10B981',
    'rejected': '#EF4444',
    'complete': '#059669'
  }

  const chartData = Object.entries(data || {}).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#6B7280'
  }))

  return (
    <div className="p-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

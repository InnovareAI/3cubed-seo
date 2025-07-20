import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ContentStatus } from '@/lib/supabase'

interface StatusDistributionChartProps {
  data?: Record<string, number>
}

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const COLORS: Record<ContentStatus, string> = {
    'draft': '#9CA3AF',
    'pending_seo_review': '#3B82F6',
    'pending_client_review': '#EAB308',
    'pending_mlr_review': '#8B5CF6',
    'requires_revision': '#EF4444',
    'approved': '#10B981',
    'published': '#059669'
  }

  const STATUS_LABELS: Record<ContentStatus, string> = {
    'draft': 'Draft',
    'pending_seo_review': 'SEO Review',
    'pending_client_review': 'Client Review',
    'pending_mlr_review': 'MLR Review',
    'requires_revision': 'Needs Revision',
    'approved': 'Approved',
    'published': 'Published'
  }

  const chartData = Object.entries(data || {}).map(([status, count]) => ({
    name: STATUS_LABELS[status as ContentStatus] || status,
    value: count,
    color: COLORS[status as ContentStatus] || '#6B7280'
  }))

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value} items`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

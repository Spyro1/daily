import { useState } from 'react'
import {
  Box,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TransactionBrief } from '@/api/generated'
import { deriveChartData, getDateRange, type Interval } from '../utils/dateUtils'

interface Props {
  transactions: TransactionBrief[]
  interval: Interval
  onIntervalChange: (interval: Interval) => void
  customRange: [Date, Date]
  onCustomRangeChange: (range: [Date, Date]) => void
}

const INTERVALS: { label: string; value: Interval }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
]

function formatYAxis(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value}`
}

function toInputDate(d: Date): string {
  return d.toISOString().split('T')[0]!
}

export function BalanceTrendChart({
  transactions,
  interval,
  onIntervalChange,
  customRange,
  onCustomRangeChange,
}: Props) {
  const theme = useTheme()
  const [hovered, setHovered] = useState<string | null>(null)

  const dateRange = getDateRange(interval, customRange)
  const chartData = deriveChartData(transactions, interval, dateRange)

  const handleIntervalChange = (_: React.SyntheticEvent, val: Interval | null) => {
    if (val) onIntervalChange(val)
  }

  return (
    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Cash Flow</Typography>
        {/* Legend */}
        <Stack direction="row" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 12, height: 3, borderRadius: 2, bgcolor: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary">
              Income
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 12, height: 3, borderRadius: 2, bgcolor: 'error.main' }} />
            <Typography variant="caption" color="text.secondary">
              Expense
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Interval selector */}
      <ToggleButtonGroup
        value={interval}
        exclusive
        size="small"
        onChange={handleIntervalChange}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        {INTERVALS.map((item) => (
          <ToggleButton
            key={item.value}
            value={item.value}
            sx={{ px: 1.5, fontSize: '0.75rem' }}
          >
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Custom date pickers */}
      {interval === 'custom' && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={toInputDate(customRange[0])}
            onChange={(e) => {
              if (!e.target.value) return
              onCustomRangeChange([new Date(e.target.value), customRange[1]])
            }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={toInputDate(customRange[1])}
            onChange={(e) => {
              if (!e.target.value) return
              onCustomRangeChange([customRange[0], new Date(e.target.value)])
            }}
          />
        </Stack>
      )}

      {/* Chart */}
      {chartData.length === 0 ? (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No transaction data for this period
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            onMouseLeave={() => setHovered(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              axisLine={false}
              tickLine={false}
              width={46}
            />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`]}
              cursor={{ stroke: theme.palette.divider }}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                onMouseEnter: () => setHovered('income'),
              }}
              opacity={hovered && hovered !== 'income' ? 0.3 : 1}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke={theme.palette.error.main}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                onMouseEnter: () => setHovered('expense'),
              }}
              opacity={hovered && hovered !== 'expense' ? 0.3 : 1}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  )
}

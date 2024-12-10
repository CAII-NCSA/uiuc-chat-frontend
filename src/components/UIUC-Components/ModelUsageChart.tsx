import React, { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { LoadingSpinner } from './LoadingSpinner'
import { Text } from '@mantine/core'

interface ModelUsage {
  model_name: string
  count: number
  percentage: number
}

interface ModelUsageChartProps {
  data: ModelUsage[] | null
  isLoading: boolean
  error: string | null
}

// ColorBrewer palette (colorblind-friendly)
const COLORS = [
  '#1f77b4', // blue
  '#2ca02c', // green
  '#ff7f0e', // orange
  '#9467bd', // purple
  '#8c564b', // brown
  '#7f7f7f', // gray
]

const ModelUsageChart: React.FC<ModelUsageChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isLoading) return <LoadingSpinner />
  if (error) return <Text color="red">{error}</Text>
  if (!data || data.length === 0)
    return <Text>No model usage data available</Text>

  // Group models with less than 1% usage into "Other"
  const threshold = 1
  const groupedData = data.reduce(
    (acc, item) => {
      if (item.percentage >= threshold) {
        acc.main.push(item)
      } else {
        acc.other.count += item.count
        acc.other.percentage += item.percentage
      }
      return acc
    },
    {
      main: [] as ModelUsage[],
      other: { model_name: 'Other', count: 0, percentage: 0 } as ModelUsage,
    },
  )

  // Sort main data by percentage in descending order
  groupedData.main.sort((a, b) => b.percentage - a.percentage)

  const finalData = [
    ...groupedData.main,
    ...(groupedData.other.count > 0 ? [groupedData.other] : []),
  ]

  const chartData = finalData.map((item) => ({
    name: item.model_name,
    value: item.count,
    percentage: item.percentage.toFixed(1),
  }))

  // Custom label renderer with improved positioning
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180

    // Adjust label visibility threshold based on screen size
    const minPercentage = windowWidth < 768 ? 0.08 : 0.02 // 8% on mobile, 2% on desktop
    if (percent < minPercentage) return null

    // Adjust radius based on screen size
    const radius =
      windowWidth < 768
        ? outerRadius * 1.1 // Closer to pie on mobile
        : outerRadius * 1.2 // Further out on desktop

    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const textAnchor = x > cx ? 'start' : 'end'

    // Adjust name truncation based on screen size
    const maxLength = windowWidth < 768 ? 8 : 15
    const truncatedName =
      name.length > maxLength ? name.substring(0, maxLength - 3) + '...' : name

    // On mobile, only show percentage for small segments
    const labelText =
      windowWidth < 768 && percent < 0.15
        ? `${(percent * 100).toFixed(1)}%`
        : `${truncatedName} (${(percent * 100).toFixed(1)}%)`

    return (
      <>
        <text
          x={x}
          y={y}
          fill="#fff"
          textAnchor={textAnchor}
          dominantBaseline="middle"
          style={{
            fontSize: windowWidth < 768 ? '10px' : '12px',
            fontWeight: 500,
          }}
        >
          {labelText}
        </text>
        <path
          d={`M${cx + (outerRadius + 2) * Math.cos(-midAngle * RADIAN)},${
            cy + (outerRadius + 2) * Math.sin(-midAngle * RADIAN)
          }L${x - (textAnchor === 'start' ? 5 : -5)},${y}`}
          stroke="#fff"
          fill="none"
          strokeWidth={1}
          opacity={0.5}
        />
      </>
    )
  }

  return (
    <div style={{ width: '100%', height: windowWidth < 768 ? 300 : 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={windowWidth < 768 ? 60 : 80}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#15162c"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()} (${props.payload.percentage}%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: 'rgba(22, 22, 34, 0.9)',
              border: '1px solid #333',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              fontSize: windowWidth < 768 ? '10px' : '12px',
              paddingLeft: windowWidth < 768 ? '10px' : '20px',
              maxWidth: windowWidth < 768 ? '45%' : '35%',
            }}
            formatter={(value: string, entry: any) => {
              const item = chartData.find((d) => d.name === value)
              const maxLength = windowWidth < 768 ? 10 : 15
              const truncatedName =
                value.length > maxLength
                  ? value.substring(0, maxLength - 3) + '...'
                  : value
              return [`${truncatedName} (${item?.percentage}%)`]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ModelUsageChart

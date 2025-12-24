"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyTaskData {
  month: string
  completed: number
  pending: number
}

interface AnalyticsData {
  tasksCompleted: number
  tasksPending: number
  totalTasks: number
  tasksByMonth: MonthlyTaskData[]
}

export default function PerformanceAnalytics({
  employeeId,
}: {
  employeeId: string
}) {
  const [performance, setPerformance] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [completionData, setCompletionData] = useState<any[]>([])
  const [growthData, setGrowthData] = useState<any[]>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `/api/analytics/employee/${encodeURIComponent(employeeId)}`
        )
        if (!res.ok) throw new Error("Failed to fetch analytics")

        const data: AnalyticsData = await res.json()

        const months = [
          "Jan","Feb","Mar","Apr","May","Jun",
          "Jul","Aug","Sep","Oct","Nov","Dec"
        ]

        const monthly = months.map((m) => {
          const found = data.tasksByMonth.find((t) => t.month === m)
          return {
            month: m,
            completed: found?.completed ?? 0,
          }
        })

        /* ===============================
           BAR CHART → TASK COMPLETION
        =============================== */
        setCompletionData(monthly)

        /* ===============================
           LINE CHART → GROWTH %
        =============================== */
        const growth = monthly.map((curr, index) => {
          if (index === 0) {
            return { month: curr.month, growth: 0 }
          }

          const prev = monthly[index - 1].completed

          let growthPercent = 0
          if (prev === 0 && curr.completed > 0) {
            growthPercent = 100
          } else if (prev > 0) {
            growthPercent = ((curr.completed - prev) / prev) * 100
          }

          return {
            month: curr.month,
            growth: Math.round(growthPercent),
          }
        })

        setGrowthData(growth)
        setPerformance(data)
      } catch (err) {
        console.error(err)
        setPerformance(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [employeeId])

  if (loading) return <p>Loading analytics...</p>
  if (!performance) return <p>No performance data available</p>

  const completionRate = Math.round(
    (performance.tasksCompleted / performance.totalTasks) * 100
  )

  return (
    <div className="space-y-6">
      {/* ===== METRICS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performance.totalTasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {performance.tasksCompleted}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== GROWTH % LINE CHART ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trend (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Line
                dataKey="growth"
                stroke="#4caf50"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== TASK COMPLETION BAR CHART ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Task Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#00bcd4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { TrendingUp } from "lucide-react"

interface MonthlyTaskData {
  month: string
  completed: number
  pending: number
}

interface AnalyticsData {
  tasksCompleted: number
  tasksPending: number
  totalTasks: number
  totalRevenue: number
  averageCompletionTime: number
  totalHours: number
  growthPercentage: number
  tasksByMonth: MonthlyTaskData[]
  tasksByStatus: { Completed: number; "In Progress": number; Pending: number }
}

interface PerformanceAnalyticsProps {
  employeeId: string
}

export default function PerformanceAnalytics({ employeeId }: PerformanceAnalyticsProps) {
  const [performance, setPerformance] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lineChartData, setLineChartData] = useState<MonthlyTaskData[]>([])
  const [barChartData, setBarChartData] = useState<MonthlyTaskData[]>([])

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await fetch(`/api/analytics/employee/${employeeId}`)
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data: AnalyticsData = await res.json()

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Prepare monthly data with defaults
        const monthlyData: MonthlyTaskData[] = months.map((m) => {
          const monthRecord = data.tasksByMonth.find((t) => t.month === m)
          return {
            month: m,
            completed: monthRecord?.completed || 0,
            pending: monthRecord?.pending || 0,
          }
        })

        // Cumulative data for LineChart
        let cumulativeCompleted = 0
        let cumulativePending = 0
        const cumulativeData = monthlyData.map((m) => {
          cumulativeCompleted += m.completed
          cumulativePending += m.pending
          return {
            month: m.month,
            completed: cumulativeCompleted,
            pending: cumulativePending,
          }
        })

        setPerformance(data)
        setBarChartData(monthlyData)
        setLineChartData(cumulativeData)
      } catch (error) {
        console.log("[v0] Error fetching performance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [employeeId])

  if (loading) return <p>Loading analytics...</p>
  if (!performance) return <p>No performance data available</p>

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-primary">
                {performance.totalTasks > 0
                  ? ((performance.tasksCompleted / performance.totalTasks) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Avg. Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{performance.averageCompletionTime.toFixed(1)} days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">{performance.totalHours} hrs</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">+{performance.growthPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart (Cumulative) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">Task Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e5a8e" />
              <XAxis dataKey="month" stroke="#e3f2fd" />
              <YAxis stroke="#e3f2fd" />
              <Tooltip contentStyle={{ backgroundColor: "#0d3b66", border: "1px solid #1e5a8e" }} />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#00bcd4" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#ffb74d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart (Monthly Counts) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e5a8e" />
              <XAxis dataKey="month" stroke="#e3f2fd" />
              <YAxis stroke="#e3f2fd" />
              <Tooltip contentStyle={{ backgroundColor: "#0d3b66", border: "1px solid #1e5a8e" }} />
              <Legend />
              <Bar dataKey="completed" fill="#00bcd4" />
              <Bar dataKey="pending" fill="#ffb74d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

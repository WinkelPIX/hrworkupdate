"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getApiUrl } from '@/lib/config';
export default function AnalyticsDashboard({ analytics, tasks }: any) {
  const tasksByStatus = {
    Completed: tasks?.filter((t: any) => t.taskStatus === "Completed").length || 0,
    "In Progress": tasks?.filter((t: any) => t.taskStatus === "In Progress").length || 0,
    Pending: tasks?.filter((t: any) => t.taskStatus === "Pending").length || 0,
    "On Hold": tasks?.filter((t: any) => t.taskStatus === "On Hold").length || 0,
  }

  const statusData = Object.entries(tasksByStatus).map(([name, value]) => ({ name, value }))

  const COLORS = ["#00bcd4", "#64b5f6", "#ffb74d", "#e57373"]
  const revenueData = [
    {
      name: "Last Month",
      value: analytics?.companyRevenue?.lastMonthRevenue || 0,
    },
    {
      name: "Current Month",
      value: analytics?.companyRevenue?.currentMonthRevenue || 0,
    },
  ];


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{tasks?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{tasksByStatus.Completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400">{tasksByStatus["In Progress"]}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{tasksByStatus.Pending}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e5a8e" />
                <XAxis dataKey="name" stroke="#e3f2fd" />
                <YAxis stroke="#e3f2fd" />
                <Tooltip contentStyle={{ backgroundColor: "#0d3b66", border: "1px solid #1e5a8e" }} />
                <Bar dataKey="value" fill="#00bcd4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">
              Company Revenue Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e5a8e" />
                <XAxis dataKey="name" stroke="#e3f2fd" />
                <YAxis stroke="#e3f2fd" />
                <Tooltip contentStyle={{ backgroundColor: "#0d3b66", border: "1px solid #1e5a8e" }} />
                <Bar dataKey="value" fill="#64b5f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}

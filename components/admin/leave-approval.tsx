"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AttendanceRecord {
  _id: string
  employeeId: string
  type: "ATTENDANCE" | "LEAVE"
  status?: "FULL" | "HALF" | "ABSENT"
  date?: string
  fromDate?: string
  toDate?: string
  days?: number
  reason?: string
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED"
  createdAt?: string
}

export default function LeaveApproval() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")

  /* ================= MONTH STATE ================= */
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  )

  /* ================= FETCH ================= */
  const fetchData = async () => {
    const res = await fetch("/api/attendance")
    const data = await res.json()

    if (Array.isArray(data)) {
      setRecords(data)
    } else {
      setRecords([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ================= MONTH FILTER ================= */
  const monthFilteredRecords = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 1)

    return records.filter((r) => {
      const rawDate =
        r.type === "ATTENDANCE"
          ? r.date
          : r.fromDate || r.createdAt

      if (!rawDate) return false

      const d = new Date(rawDate)
      return d >= start && d < end
    })
  }, [records, selectedMonth])

  /* ================= EMPLOYEE SUMMARY ================= */
  const employeeSummary = useMemo(() => {
    const map: Record<
      string,
      { FULL: number; HALF: number; ABSENT: number; LEAVE: number }
    > = {}

    monthFilteredRecords.forEach((r) => {
      if (!map[r.employeeId]) {
        map[r.employeeId] = {
          FULL: 0,
          HALF: 0,
          ABSENT: 0,
          LEAVE: 0,
        }
      }

      if (r.type === "ATTENDANCE") {
        if (r.status === "FULL") map[r.employeeId].FULL++
        if (r.status === "HALF") map[r.employeeId].HALF++
        if (r.status === "ABSENT") map[r.employeeId].ABSENT++
      }

      if (r.type === "LEAVE" && r.approvalStatus === "APPROVED") {
        map[r.employeeId].LEAVE += r.days || 1
      }
    })

    return map
  }, [monthFilteredRecords])

  /* ================= LEAVES ================= */
  const leaves = useMemo(() => {
    return monthFilteredRecords.filter(
      (r) =>
        r.type === "LEAVE" &&
        (statusFilter === "ALL" || r.approvalStatus === statusFilter)
    )
  }, [monthFilteredRecords, statusFilter])

  /* ================= ACTION ================= */
  const updateStatus = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setLoading(true)
    await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveId, approvalStatus: status }),
    })
    await fetchData()
    setLoading(false)
  }

  return (
    <div className="space-y-6">

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-2 bg-background text-foreground"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const value = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`
            return (
              <option key={value} value={value}>
                {value}
              </option>
            )
          })}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded px-3 py-2 bg-background text-foreground"
        >
          <option value="ALL">All Leaves</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* ================= SUMMARY ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance Summary</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Employee</th>
                <th className="p-2 text-center">Full</th>
                <th className="p-2 text-center">Half</th>
                <th className="p-2 text-center">Absent</th>
                <th className="p-2 text-center">Leave</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(employeeSummary).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No attendance records
                  </td>
                </tr>
              ) : (
                Object.entries(employeeSummary)
                  .sort((a, b) => b[1].FULL - a[1].FULL) // ✅ SORT BY FULL DESC
                  .map(([empId, s]) => (
                    <tr key={empId} className="border-b">
                      <td className="p-2">{empId}</td>
                      <td className="p-2 text-center">{s.FULL}</td>
                      <td className="p-2 text-center">{s.HALF}</td>
                      <td className="p-2 text-center">{s.ABSENT}</td>
                      <td className="p-2 text-center">{s.LEAVE}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= LEAVE LIST ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No leave records found
            </p>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave._id}
                className="border rounded p-3 space-y-2"
              >
                <div><b>Employee:</b> {leave.employeeId}</div>
                <div><b>Dates:</b> {leave.fromDate} → {leave.toDate}</div>
                <div><b>Days:</b> {leave.days}</div>
                <div><b>Reason:</b> {leave.reason}</div>
                <div><b>Status:</b> {leave.approvalStatus}</div>

                {leave.approvalStatus === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={() => updateStatus(leave._id, "APPROVED")}
                      className="bg-green-600 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={() => updateStatus(leave._id, "REJECTED")}
                      className="bg-red-600 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )

}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Leave {
  _id: string
  employeeId: string
  fromDate: string
  toDate: string
  days: number
  reason: string
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
}

export default function LeaveApproval() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLeaves = async () => {
    const res = await fetch("/api/attendance")
    const data = await res.json()

    if (Array.isArray(data)) {
      setLeaves(
        data.filter(
          (r) => r.type === "LEAVE" && r.approvalStatus === "PENDING"
        )
      )
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const updateStatus = async (leaveId: string, status: "APPROVED" | "REJECTED") => {
    setLoading(true)

    await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leaveId,
        approvalStatus: status,
      }),
    })

    await fetchLeaves()
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Approval</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {leaves.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending leave requests
          </p>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave._id}
              className="border rounded p-3 space-y-2"
            >
              <div className="text-sm">
                <b>Employee:</b> {leave.employeeId}
              </div>
              <div className="text-sm">
                <b>Dates:</b> {leave.fromDate} → {leave.toDate}
              </div>
              <div className="text-sm">
                <b>Days:</b> {leave.days}
              </div>
              <div className="text-sm">
                <b>Reason:</b> {leave.reason}
              </div>

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
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

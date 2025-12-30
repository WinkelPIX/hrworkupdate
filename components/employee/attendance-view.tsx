"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type AttendanceStatus = "FULL" | "HALF" | "ABSENT" | "LEAVE"

interface AttendanceViewProps {
  employeeId: string // username
}

export default function AttendanceView({ employeeId }: AttendanceViewProps) {
  const [status, setStatus] = useState<AttendanceStatus>("FULL")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [totalDays, setTotalDays] = useState(0)

  /* ================= Fetch Attendance Count ================= */
  const fetchAttendance = async () => {
    try {
      const res = await fetch(
        `/api/attendance?employeeId=${employeeId}`
      )
      const data = await res.json()

      if (Array.isArray(data)) {
        setTotalDays(data.length)
      }
    } catch (error) {
      console.error("Fetch attendance error:", error)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  /* ================= Submit Attendance ================= */
  const submitAttendance = async () => {
    setMessage("")

    if (!password) {
      setMessage("Please enter your password")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          status,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Failed to mark attendance")
      } else {
        setMessage("Attendance marked successfully ✅")
        setPassword("")
        fetchAttendance()
      }
    } catch {
      setMessage("Server error, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-start">
      <Card className="w-full max-w-md shadow-lg border border-border bg-background">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Attendance
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Attendance Type
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AttendanceStatus)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="FULL">Full Day</option>
              <option value="HALF">Half Day</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your login password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={submitAttendance}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit Attendance"}
          </Button>

          {/* Message */}
          {message && (
            <p
              className={`text-sm text-center ${
                message.includes("success")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          {/* Count */}
          <div className="pt-2 text-center text-sm text-muted-foreground">
            Total Days Marked:{" "}
            <span className="font-semibold text-foreground">
              {totalDays}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

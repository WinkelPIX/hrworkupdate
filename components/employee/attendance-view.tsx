"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AttendanceView({ employeeId }: { employeeId: string }) {
  const [status, setStatus] = useState("FULL")
  const [password, setPassword] = useState("")
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [message, setMessage] = useState("")

  const fetchAttendance = async () => {
    const res = await fetch(`/api/attendance?employeeId=${employeeId}`)
    const data = await res.json()
    setAttendanceCount(data.length)
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const submitAttendance = async () => {
    setMessage("")
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
      setMessage(data.error || "Failed")
    } else {
      setMessage("Attendance marked successfully")
      fetchAttendance()
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="FULL">Full Day</option>
          <option value="HALF">Half Day</option>
          <option value="ABSENT">Absent</option>
          <option value="LEAVE">Leave</option>
        </select>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <Button className="w-full" onClick={submitAttendance}>
          Submit Attendance
        </Button>

        {message && <p className="text-sm text-center">{message}</p>}

        <p className="text-sm text-muted-foreground text-center">
          Total Days Present: <strong>{attendanceCount}</strong>
        </p>
      </CardContent>
    </Card>
  )
}

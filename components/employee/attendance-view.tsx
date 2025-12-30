"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Mode = "FULL" | "HALF" | "ABSENT" | "LEAVE"

export default function AttendanceView({ employeeId }: { employeeId: string }) {
  const [mode, setMode] = useState<Mode>("FULL")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // leave fields
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [days, setDays] = useState(1)
  const [reason, setReason] = useState("")
  const [records, setRecords] = useState<any[]>([])

  const fetchData = async () => {
    const res = await fetch(`/api/attendance?employeeId=${employeeId}`)
    const data = await res.json()
    if (Array.isArray(data)) setRecords(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const submit = async () => {
    setMessage("")
    setLoading(true)

    const payload =
      mode === "LEAVE"
        ? {
            employeeId,
            type: "LEAVE",
            fromDate,
            toDate,
            days,
            reason,
          }
        : {
            employeeId,
            type: "ATTENDANCE",
            status: mode,
            password,
          }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Failed")
      } else {
        setMessage("Submitted successfully ✅")
        setPassword("")
        setFromDate("")
        setToDate("")
        setDays(1)
        setReason("")
        fetchData()
      }
    } catch {
      setMessage("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Attendance & Leave</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <select
  value={mode}
  onChange={(e) => setMode(e.target.value as Mode)}
  className="
    w-full
    rounded-md
    border
    border-border
    bg-background
    text-foreground
    px-3
    py-2
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-primary
  "
>
  <option
    value="FULL"
    className="bg-background text-foreground"
  >
    Full Day
  </option>

  <option
    value="HALF"
    className="bg-background text-foreground"
  >
    Half Day
  </option>

  <option
    value="ABSENT"
    className="bg-background text-foreground"
  >
    Absent
  </option>

  <option
    value="LEAVE"
    className="bg-background text-foreground"
  >
    Leave
  </option>
</select>


        {mode !== "LEAVE" && (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded pr-12"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        )}

        {mode === "LEAVE" && (
          <>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-3 py-2 rounded" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-3 py-2 rounded" />
            <input type="number" min={1} value={days} onChange={(e) => setDays(+e.target.value)} className="border px-3 py-2 rounded" />
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="border px-3 py-2 rounded" placeholder="Reason" />
          </>
        )}

        <Button onClick={submit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>

        {message && <p className="text-sm">{message}</p>}

        <div className="space-y-2">
          {records.map((r) => (
            <div key={r._id} className="border p-2 rounded text-sm flex justify-between">
              <span>
                {r.type === "LEAVE"
                  ? `Leave ${r.fromDate} → ${r.toDate}`
                  : `Attendance ${r.date} (${r.status})`}
              </span>
              {r.type === "LEAVE" && (
                <span className="text-yellow-600">{r.approvalStatus}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

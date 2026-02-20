"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, CheckCircle2, AlertTriangle, ArrowRight, Clock, XCircle } from "lucide-react"

export default function NoticePeriodForm({ user }: any) {
  const [reason, setReason] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true) // Start loading to check status
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [existingRequest, setExistingRequest] = useState<any>(null)

  const today = new Date()
  const lastWorkingDay = new Date()
  lastWorkingDay.setDate(today.getDate() + 30)

  // 1. Fetch existing resignation status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/admin/resignation?username=${user.username}`)
        if (response.ok) {
          const data = await response.json()
          // Find the most recent request for this user
          const userRequests = data.filter((r: any) => r.username === user.username)
          if (userRequests.length > 0) {
            // Sort by date descending to get the latest
            const latest = userRequests.sort((a: any, b: any) => 
              new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
            )[0]
            setExistingRequest(latest)
          }
        }
      } catch (err) {
        console.error("Failed to check resignation status")
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [user.username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    
    try {
      const response = await fetch("/api/admin/resignation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          lastWorkingDay: lastWorkingDay.toISOString(),
          reason: reason,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || "Failed to submit request.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Helper: Check if 3 days have passed since rejection
  const getCooldownStatus = () => {
    if (!existingRequest || existingRequest.status !== "REJECTED") return { available: true }
    
    const rejectionDate = new Date(existingRequest.submissionDate)
    const nextAvailableDate = new Date(rejectionDate)
    nextAvailableDate.setDate(rejectionDate.getDate() + 3)
    
    const diffTime = nextAvailableDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      available: today >= nextAvailableDate,
      daysRemaining: diffDays,
      nextDate: nextAvailableDate.toDateString()
    }
  }

  const cooldown = getCooldownStatus()

  // 2. Loading State
  if (loading) {
    return <div className="text-center py-20 text-slate-400">Checking resignation status...</div>
  }

  // 3. UI for Approved State
  if (existingRequest?.status === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto mt-10 animate-in fade-in zoom-in duration-300">
        <Card className="border-emerald-500/50 bg-emerald-500/10">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-50">Resignation Approved</h2>
            <p className="text-emerald-200/70 max-w-md mx-auto">
              Your exit process is officially approved. Your final working day is:
            </p>
            <div className="inline-block px-6 py-2 bg-emerald-500/20 rounded-full text-emerald-400 font-mono text-xl border border-emerald-500/30">
              {new Date(existingRequest.lastWorkingDay).toDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 4. UI for Pending State or Recently Submitted
  if (isSubmitted || existingRequest?.status === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto mt-10 animate-in fade-in zoom-in duration-300">
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-50">Request Pending</h2>
            <p className="text-amber-200/70 max-w-md mx-auto">
              You have an active resignation request under review. You cannot submit another request at this time.
            </p>
            <div className="text-slate-400 text-sm">
              Submitted on: {new Date(existingRequest?.submissionDate || today).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      {/* 🔹 Policy Section */}
      <div className="lg:col-span-4 space-y-4">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle size={20} />
              <CardTitle className="text-lg font-semibold uppercase tracking-wider">Exit Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cooldown Alert for Rejected Users */}
            {!cooldown.available && (
               <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                 <XCircle className="text-red-500 shrink-0 mt-1" size={16} />
                 <p className="text-xs text-red-200">
                   Your last request was rejected. You can re-apply in <b>{cooldown.daysRemaining} days</b> ({cooldown.nextDate}).
                 </p>
               </div>
            )}

            {[
              { label: "1 Month Notice", text: "Standard 30-day notice is mandatory for all full-time roles." },
              { label: "Knowledge Transfer", text: "Complete documentation and handover to your direct manager." },
              { label: "Asset Return", text: "Return laptop, ID, and keys by your last working day." },
              { label: "Leave Policy", text: "Leaves during notice period require special HR approval." }
            ].map((item, i) => (
              <div key={i} className="group">
                <p className="text-slate-200 font-medium flex items-center gap-2">
                  <ArrowRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                  {item.label}
                </p>
                <p className="text-slate-400 text-sm mt-1 ml-5 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 🔹 Form Section */}
      <div className="lg:col-span-8">
        <Card className={`border-slate-800 bg-slate-900 shadow-xl ${!cooldown.available ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="text-2xl text-slate-50">Resignation Form</CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Initiate your exit process. This action is formal and logged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative overflow-hidden group p-6 bg-slate-800/50 border border-slate-700 rounded-xl transition-all hover:border-slate-600">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                    <Calendar className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Estimated Last Working Day</p>
                    <p className="text-xl font-bold text-slate-100 mt-1">
                      {lastWorkingDay.toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 ml-1">Reason for Leaving</label>
                <Textarea 
                  required
                  placeholder="Please provide a brief professional reason for your departure..."
                  className="min-h-[140px] bg-slate-950 border-slate-800 focus:border-primary/50 focus:ring-primary/20 text-slate-200 placeholder:text-slate-600 rounded-xl resize-none p-4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]" 
                disabled={submitting || !cooldown.available}
              >
                {submitting ? "Processing..." : "Submit Resignation & Start Notice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
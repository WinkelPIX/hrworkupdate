"use client"

import { useState, useEffect, useCallback } from "react"

export function useRealTimeData<T>(endpoint: string, interval = 5000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error("Failed to fetch data")
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, interval)
    return () => clearInterval(intervalId)
  }, [fetchData, interval])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh }
}

export function useRealTimeTask(taskId: string, interval = 5000) {
  return useRealTimeData(`/api/tasks/${taskId}`, interval)
}

export function useRealTimeEmployeeTasks(employeeId: string, interval = 5000) {
  return useRealTimeData(`/api/tasks/employee/${employeeId}`, interval)
}

export function useRealTimeAnalytics(interval = 10000) {
  return useRealTimeData("/api/analytics/company", interval)
}

export function useRealTimeEmployeeAnalytics(employeeId: string, interval = 10000) {
  return useRealTimeData(`/api/analytics/employee/${employeeId}`, interval)
}

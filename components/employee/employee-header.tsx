"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function EmployeeHeader({ user, onLogout }: any) {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your tasks and performance</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.department || "Design"}</p>
          </div>
          <Button
            onClick={onLogout}
            size="sm"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

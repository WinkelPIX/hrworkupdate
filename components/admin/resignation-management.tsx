"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner" // or your preferred toast lib

export default function ResignationManagement({ resignations, onRefresh }: any) {
  
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/resignation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(`Request ${newStatus.toLowerCase()} successfully`)
        onRefresh()
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          Notice Period Management
          <Badge variant="outline" className="ml-2 border-slate-700 text-slate-400">
            {resignations.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="text-slate-400">Employee</TableHead>
              <TableHead className="text-slate-400">Submission Date</TableHead>
              <TableHead className="text-slate-400">Last Working Day</TableHead>
              <TableHead className="text-slate-400">Reason</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resignations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  No resignation requests found.
                </TableCell>
              </TableRow>
            ) : (
              resignations.map((r: any) => (
                <TableRow key={r._id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <TableCell className="font-medium text-slate-200">{r.username}</TableCell>
                  <TableCell className="text-slate-400">
                    {new Date(r.submissionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-amber-500 font-semibold">
                    {new Date(r.lastWorkingDay).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-slate-400" title={r.reason}>
                    {r.reason}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        r.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        r.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.status === "PENDING" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handleUpdateStatus(r._id, "APPROVED")}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleUpdateStatus(r._id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
"use client"

import { useState } from "react"
import { Search, Send, CheckCircle2, FileCheck, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AccountsManagement({
  invoices,
  onRefresh,
}: {
  invoices: any[]
  onRefresh: () => void
}) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL") // ALL, PENDING_SEND, SENT, COMPLETED
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // 1. Filter: Only show PAID invoices
  const paidInvoices = invoices.filter((inv) => inv.isPaid)

  // 2. Search & Status Filter Logic
  const filteredInvoices = paidInvoices.filter((inv) => {
    // Search Logic
    const matchesSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    // Status Filter Logic
    if (filter === "ALL") return true
    if (filter === "PENDING_SEND") return !inv.sentToCA
    if (filter === "SENT") return inv.sentToCA && !inv.caPaid
    if (filter === "COMPLETED") return inv.sentToCA && inv.caPaid
    
    return true
  })

  // Helper to update invoice status
  const updateStatus = async (id: string, updates: any) => {
    setLoadingId(id)
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
      if (res.ok) onRefresh()
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Accounts & CA Ledger</h2>
          <p className="text-sm text-muted-foreground">
            Manage paid invoices and CA filing status.
          </p>
        </div>
        
        {/* Stats Summary */}
        <div className="flex gap-4 text-sm">
             <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded border border-blue-500/20">
                To Send: {paidInvoices.filter(i => !i.sentToCA).length}
             </div>
             <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded border border-yellow-500/20">
                Pending Filing: {paidInvoices.filter(i => i.sentToCA && !i.caPaid).length}
             </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 border-b border-border pb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { label: "All Paid", value: "ALL" },
            { label: "Needs Sending", value: "PENDING_SEND" },
            { label: "Sent to CA", value: "SENT" },
            { label: "CA Completed", value: "COMPLETED" },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Invoice #</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Client</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">GST</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Current Stage</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-primary">CA Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No invoices found matching your filters.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv: any) => (
                <tr key={inv._id} className="border-b border-border hover:bg-card/50 transition">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {inv.invoiceNumber}
                    <div className="text-[10px] text-muted-foreground">
                        {new Date(inv.billingDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{inv.clientName}</td>
                  <td className="py-3 px-4 text-sm font-bold text-foreground">
                    ₹{inv.totalAmount?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {inv.clientGST ? inv.clientGST : "Unregistered"}
                  </td>
                  
                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {!inv.sentToCA ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Pending Send
                        </span>
                    ) : !inv.caPaid ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Sent to CA
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Fully Filed
                        </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      
                      {/* Button 1: Send to CA */}
                      {!inv.sentToCA && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={loadingId === inv._id}
                          onClick={() => updateStatus(inv._id, { sentToCA: true, sentToCADate: new Date() })}
                          className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send to CA
                        </Button>
                      )}

                      {/* Button 2: CA Payment/Filed */}
                      {inv.sentToCA && !inv.caPaid && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={loadingId === inv._id}
                          onClick={() => updateStatus(inv._id, { caPaid: true, caPaidDate: new Date() })}
                          className="h-8 text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                        >
                          <FileCheck className="w-3 h-3 mr-1" />
                          Mark Filed
                        </Button>
                      )}

                      {/* Completed State */}
                      {inv.caPaid && (
                        <div className="text-green-500 flex items-center gap-1 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Done
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
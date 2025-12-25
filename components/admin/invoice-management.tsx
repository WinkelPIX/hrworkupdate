"use client"

import { useState } from "react"
import { Trash2, Printer, CheckCircle, Clock } from "lucide-react"

export default function InvoiceManagement({
  invoices,
  onRefresh,
}: {
  invoices: any[]
  onRefresh: () => void
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // 1. Filter: Pending Invoices (Not Paid)
  const pendingInvoices = invoices.filter((inv: any) => !inv.isPaid)

  // 2. Filter: Recently Paid (Paid + within last 24 hours)
  const recentlyPaidInvoices = invoices.filter((inv: any) => {
    if (!inv.isPaid || !inv.paymentDate) return false
    
    const paymentTime = new Date(inv.paymentDate).getTime()
    const currentTime = new Date().getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000

    return (currentTime - paymentTime) < twentyFourHours
  })

  const handleMarkPaid = async (id: string) => {
    if (!confirm("Mark this invoice as PAID?")) return

    setLoadingId(id)
    try {
      // We now send paymentDate as well so we can track the 24hr window
      const res = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          isPaid: true, 
          paymentDate: new Date() // Capture the time
        }),
      })

      if (res.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("Failed to update invoice status", error)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/invoices?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("Failed to delete invoice", error)
    } finally {
      setLoadingId(null)
    }
  }

  const handlePrint = (invoice: any) => {
    console.log("Printing invoice:", invoice.invoiceNumber)
    alert(`Printing Invoice: ${invoice.invoiceNumber}`)
  }

  return (
    <div className="space-y-8">
      {/* SECTION 1: PENDING INVOICES */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Invoice History (Pending)
          </h2>
          <div className="text-sm text-muted-foreground">
            Pending: {pendingInvoices.length}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-card/50">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Invoice #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Client</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pending invoices found
                  </td>
                </tr>
              ) : (
                pendingInvoices.map((inv: any) => (
                  <tr key={inv._id} className="border-b border-border hover:bg-card/50 transition">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {new Date(inv.billingDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{inv.clientName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground truncate max-w-[200px]">
                      {inv.jobDescription}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-foreground">
                      ₹{inv.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleMarkPaid(inv._id)}
                          disabled={loadingId === inv._id}
                          className="p-1 hover:bg-green-500/20 text-green-500 rounded disabled:opacity-50"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="p-1 hover:bg-primary/20 rounded"
                          title="View/Print"
                        >
                          <Printer className="h-4 w-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          disabled={loadingId === inv._id}
                          className="p-1 hover:bg-destructive/20 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: RECENTLY PAID (Visible only if items exist) */}
      {recentlyPaidInvoices.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Payment Received (Last 24h)
            </h2>
            <div className="text-sm text-green-600/80 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Auto-clears in 24 hours
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-200 dark:border-green-900">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">Invoice #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">Received At</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentlyPaidInvoices.map((inv: any) => (
                  <tr key={inv._id} className="border-b border-green-100 dark:border-green-800/50 hover:bg-green-100/50 dark:hover:bg-green-900/20 transition">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{inv.clientName}</td>
                    <td className="py-3 px-4 text-sm font-bold text-foreground">
                      ₹{inv.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                       {/* Show time of payment */}
                      {new Date(inv.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Received
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
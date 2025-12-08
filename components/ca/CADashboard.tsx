"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea" // Added for Address
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  FileText, 
  RefreshCw, 
  Filter,
  X,
  IndianRupee,
  Download,
  Loader2 // Added for loading spinner
} from "lucide-react"

// --- Types ---
type Task = {
  _id: string
  clientName: string
  projectName: string
  employeeId: string
  workGivenDate: string
  dueDate: string
  paymentAmount: string 
  paymentReceived: boolean
  caPaymentDone: boolean
  sentToCA: boolean
  gstApplied: boolean
  taskStatus: string
  paymentStatus: string
}

export default function CADashboard({ user, setUser }: any) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  // New State for Invoice Generation
  const [invoicePreview, setInvoicePreview] = useState<any>(null)
  const [generating, setGenerating] = useState(false) // Loading state for PDF
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "",
    clientAddress: "",
    clientGST: "",
    extraNotes: ""
  })

  // --- Filter States ---
  const [filters, setFilters] = useState({
    client: "",
    project: "",
    paymentStatus: "all",
    gstStatus: "all",
    caSendStatus: "all",
    caPaymentStatus: "all",
    date: ""
  })

  // --- Fetch Data ---
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // --- Advanced Filter Logic ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchClient = t.clientName.toLowerCase().includes(filters.client.toLowerCase())
      const matchProject = t.projectName.toLowerCase().includes(filters.project.toLowerCase())
      
      let matchPay = true
      if (filters.paymentStatus !== "all") {
        const isPaid = t.paymentReceived || t.paymentStatus?.toLowerCase().includes("received")
        if (filters.paymentStatus === "paid") matchPay = isPaid
        if (filters.paymentStatus === "pending") matchPay = !isPaid
      }

      let matchGst = true
      if (filters.gstStatus !== "all") {
        const hasGst = t.gstApplied
        if (filters.gstStatus === "yes") matchGst = hasGst
        if (filters.gstStatus === "no") matchGst = !hasGst
      }

      let matchCASend = true
      if (filters.caSendStatus !== "all") {
        const sent = t.sentToCA
        if (filters.caSendStatus === "sent") matchCASend = sent
        if (filters.caSendStatus === "not_sent") matchCASend = !sent
      }

      let matchCAPay = true
      if (filters.caPaymentStatus !== "all") {
        const done = t.caPaymentDone
        if (filters.caPaymentStatus === "done") matchCAPay = done
        if (filters.caPaymentStatus === "pending") matchCAPay = !done
      }

      const matchDate = filters.date ? t.workGivenDate.includes(filters.date) : true

      return matchClient && matchProject && matchPay && matchGst && matchCASend && matchCAPay && matchDate
    })
  }, [tasks, filters])

  // --- Selection Logic ---
  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleIds = filteredTasks.map(t => t._id)
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])))
    } else {
      const visibleIds = filteredTasks.map(t => t._id)
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)))
    }
  }

  const resetFilters = () => {
    setFilters({
      client: "",
      project: "",
      paymentStatus: "all",
      gstStatus: "all",
      caSendStatus: "all",
      caPaymentStatus: "all",
      date: ""
    })
  }

  // --- Calculation & Invoice Preparation ---
  const selectedTasksData = tasks.filter(t => selectedIds.includes(t._id))
  
  const totalAmount = selectedTasksData.reduce((sum, t) => {
    const amt = parseFloat(t.paymentAmount) || 0
    return sum + amt
  }, 0)

  // 1. Prepare the Preview
  const handleGeneratePreview = () => {
    if (selectedTasksData.length === 0) return
    
    // Auto-generate a random Invoice Number for convenience
    const randomInv = `INV-${Math.floor(1000 + Math.random() * 9000)}`
    
    // Reset form with new details
    setInvoiceForm({
        invoiceNumber: randomInv,
        clientAddress: "",
        clientGST: "",
        extraNotes: ""
    })

    const invoiceData = {
      invoiceDate: new Date().toISOString(),
      items: selectedTasksData.map(t => ({
        id: t._id,
        project: t.projectName,
        client: t.clientName,
        gst: t.gstApplied,
        amount: parseFloat(t.paymentAmount) || 0,
        date: t.workGivenDate
      })),
      totalCount: selectedTasksData.length,
      grandTotal: totalAmount,
    }
    setInvoicePreview(invoiceData)
  }

  // 2. EXECUTABLE FUNCTION: Call API and Download PDF
  const handleDownloadPDF = async () => {
    if (!invoiceForm.invoiceNumber || !invoiceForm.clientAddress) {
        alert("Please fill in Invoice Number and Client Address")
        return
    }

    setGenerating(true)

    try {
        // Construct Payload matching route.ts expectations
        const payload = {
            invoiceNumber: invoiceForm.invoiceNumber,
            billingDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            clientName: selectedTasksData[0]?.clientName || "Client", // Take name from first selected task
            clientGST: invoiceForm.clientGST,
            clientAddress: invoiceForm.clientAddress,
            items: invoicePreview.items,
            gstApplied: invoicePreview.items.some((i: any) => i.gst), // If any item has GST, apply it globally (or add toggle)
            extraNotes: invoiceForm.extraNotes
        }

        const response = await fetch("/api/invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || "Failed to generate PDF")
        }

        // Handle Binary PDF Download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Invoice-${invoiceForm.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)

    } catch (error) {
        console.error("PDF Generation Error:", error)
        alert("Failed to generate PDF. Check console for details.")
    } finally {
        setGenerating(false)
    }
  }

  const isAllSelected = filteredTasks.length > 0 && filteredTasks.every(t => selectedIds.includes(t._id))

  // --- Helper: Status Badge ---
  const StatusBadge = ({ isGood, textGood, textBad }: any) => (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium border ${
      isGood 
        ? "bg-green-900/30 text-green-400 border-green-800" 
        : "bg-red-900/30 text-red-400 border-red-800"
    }`}>
      {isGood ? textGood : textBad}
    </span>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      
      {/* --- Top Header --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CA Dashboard</h1>
          <p className="text-slate-400 text-sm">Financial overview and invoice generation</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchTasks} 
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white border-0"
            onClick={() => setUser(null)}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* --- FILTER SECTION --- */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input 
            placeholder="Client Name" 
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
            value={filters.client}
            onChange={(e) => setFilters({...filters, client: e.target.value})}
          />
          <Input 
            placeholder="Project Name" 
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
            value={filters.project}
            onChange={(e) => setFilters({...filters, project: e.target.value})}
          />
          <select 
            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={filters.paymentStatus}
            onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
          >
            <option value="all">All Payment Status</option>
            <option value="paid">Paid / Received</option>
            <option value="pending">Pending</option>
          </select>
           <select 
            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={filters.gstStatus}
            onChange={(e) => setFilters({...filters, gstStatus: e.target.value})}
          >
            <option value="all">All GST Status</option>
            <option value="yes">GST Applied</option>
            <option value="no">No GST</option>
          </select>
          <select 
            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={filters.caSendStatus}
            onChange={(e) => setFilters({...filters, caSendStatus: e.target.value})}
          >
            <option value="all">All CA Send Status</option>
            <option value="sent">Sent to CA</option>
            <option value="not_sent">Not Sent</option>
          </select>
           <select 
            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={filters.caPaymentStatus}
            onChange={(e) => setFilters({...filters, caPaymentStatus: e.target.value})}
          >
            <option value="all">All CA Payment Status</option>
            <option value="done">CA Paid</option>
            <option value="pending">CA Pending</option>
          </select>
           <Input 
            type="date"
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-600 [color-scheme:dark]"
            value={filters.date}
            onChange={(e) => setFilters({...filters, date: e.target.value})}
          />
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={resetFilters} 
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4 mr-2" /> Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* --- Left Column: Table --- */}
        <div className="lg:col-span-2">
          <Card className="border-slate-800 bg-slate-900 shadow-xl">
            <CardHeader className="pb-4 border-b border-slate-800">
              <CardTitle className="text-lg text-white">Project List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[40px] pl-4">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={(c) => handleSelectAll(c as boolean)}
                        className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      />
                    </TableHead>
                    <TableHead className="text-slate-300">Client / Project</TableHead>
                    <TableHead className="text-slate-300">Work Details</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-right pr-6 text-slate-300">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">Loading data...</TableCell></TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">No projects match your filters.</TableCell></TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow 
                        key={task._id} 
                        className={`border-slate-800 transition-colors ${selectedIds.includes(task._id) ? "bg-blue-900/20 hover:bg-blue-900/30" : "hover:bg-slate-800/50"}`}
                      >
                        <TableCell className="pl-4">
                          <Checkbox 
                            checked={selectedIds.includes(task._id)}
                            onCheckedChange={() => handleSelectOne(task._id)}
                            className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{task.projectName}</span>
                            <span className="text-xs text-blue-400">{task.clientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-400">Given: {task.workGivenDate}</span>
                              <div className="flex gap-2">
                                <span className={`text-[10px] px-1.5 rounded border ${task.gstApplied ? 'border-purple-800 text-purple-400 bg-purple-900/20' : 'border-slate-700 text-slate-500'}`}>
                                  {task.gstApplied ? "GST" : "No GST"}
                                </span>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 w-12">Client:</span>
                                <StatusBadge 
                                  isGood={task.paymentReceived || task.paymentStatus?.toLowerCase().includes('received')} 
                                  textGood="Received" 
                                  textBad="Pending" 
                                />
                             </div>
                             <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 w-12">Sent CA:</span>
                                <StatusBadge isGood={task.sentToCA} textGood="Sent" textBad="Not Sent" />
                             </div>
                             <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 w-12">Paid CA:</span>
                                <StatusBadge isGood={task.caPaymentDone} textGood="Paid" textBad="Unpaid" />
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-white pr-6">
                           ₹{parseFloat(task.paymentAmount || "0").toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* --- Right Column: Sticky Invoice --- */}
        <div className="space-y-6">
          <Card className="sticky top-6 border-slate-700 bg-slate-900 shadow-2xl">
            <div className="bg-blue-600 p-4 text-white rounded-t-lg">
              <h2 className="font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Generator
              </h2>
            </div>
            
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selected</span>
                  <div className="text-3xl font-bold text-white">{selectedIds.length}</div>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                  <div className="text-3xl font-bold text-blue-400 flex items-center justify-end">
                    <IndianRupee className="w-6 h-6" />
                    {totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              {/* Step 1: Click to Preview */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12" 
                disabled={selectedIds.length === 0}
                onClick={handleGeneratePreview}
              >
                Generate Preview
              </Button>
            </CardContent>
          </Card>

          {/* --- Invoice Preview & FORM --- */}
          {invoicePreview && (
            <Card className="animate-in slide-in-from-bottom-4 bg-white text-slate-900 border-0">
              <CardHeader className="pb-2 border-b border-gray-200">
                <CardTitle className="text-xs font-bold uppercase text-gray-500">Step 2: Final Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                
                {/* --- Required API Fields Form --- */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Invoice Number</label>
                        <Input 
                            className="h-8 text-xs bg-gray-50 border-gray-300 text-black mt-1" 
                            value={invoiceForm.invoiceNumber}
                            onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Client Address (Required)</label>
                        <Textarea 
                            className="min-h-[60px] text-xs bg-gray-50 border-gray-300 text-black mt-1" 
                            placeholder="Full Billing Address"
                            value={invoiceForm.clientAddress}
                            onChange={(e) => setInvoiceForm({...invoiceForm, clientAddress: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">Client GSTIN</label>
                        <Input 
                            className="h-8 text-xs bg-gray-50 border-gray-300 text-black mt-1" 
                            placeholder="Optional"
                            value={invoiceForm.clientGST}
                            onChange={(e) => setInvoiceForm({...invoiceForm, clientGST: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">Extra Notes</label>
                        <Input 
                            className="h-8 text-xs bg-gray-50 border-gray-300 text-black mt-1" 
                            placeholder="Optional"
                            value={invoiceForm.extraNotes}
                            onChange={(e) => setInvoiceForm({...invoiceForm, extraNotes: e.target.value})}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {invoicePreview.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start text-sm border-b border-gray-100 pb-2">
                      <div>
                        <div className="font-bold text-gray-800">{item.project}</div>
                        {item.gst && <div className="text-[10px] text-purple-600 font-bold">+ GST Included</div>}
                      </div>
                      <div className="font-mono font-medium">₹{item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-100 p-3 rounded flex justify-between items-center font-bold">
                  <span>TOTAL PAYABLE</span>
                  <span className="text-lg text-blue-700">₹{invoicePreview.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                
                {/* --- Action Buttons --- */}
                <div className="grid grid-cols-1 gap-2">
                   <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={handleDownloadPDF}
                    disabled={generating}
                   >
                    {generating ? (
                        <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating PDF...
                        </>
                    ) : (
                        <>
                         <Download className="w-4 h-4 mr-2"/> Download Official PDF
                        </>
                    )}
                   </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
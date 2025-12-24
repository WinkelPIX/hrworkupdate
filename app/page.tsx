// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import LoginForm from "@/components/auth/login-form"
// import AdminDashboard from "@/components/dashboards/admin-dashboard"
// import EmployeeDashboard from "@/components/dashboards/employee-dashboard"
// import CADashboard from "@/components/ca/CADashboard"
// export default function Home() {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/auth/verify", {
//           credentials: "include",
//         })
//         if (response.ok) {
//           const data = await response.json()
//           setUser(data.user)
//         } else {
//           setUser(null)
//         }
//       } catch (error) {
//         console.log("Auth check error:", error)
//         setUser(null)
//       } finally {
//         setLoading(false)
//       }
//     }

//     checkAuth()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-background">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//           <p className="mt-4 text-foreground">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!user) {
//     return <LoginForm onLoginSuccess={setUser} />
//   }

//   return (
//     <>
//       {user.role === "Admin" ? (
//         <AdminDashboard user={user} setUser={setUser} />
//       ) : user.role === "CA" ? (
//         <CADashboard/>
//       ) : (
//         <EmployeeDashboard user={user} setUser={setUser} />
//       )}

//     </>
//   )
// }

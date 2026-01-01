"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function EmployeeProfileForm({ user, onComplete }: any) {
    const [form, setForm] = useState({
        fullName: "",
        role: "",
        joiningDate: "",
        employmentType: "FULL_TIME",
        phone: "",
        backupPhone: "",
        personalEmail: "",
        address: "",
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch(`/api/employees/profile?username=${user.username}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.profileCompleted) {
                    setForm({
                        fullName: data.fullName || "",
                        role: data.role || "",
                        joiningDate: data.joiningDate?.slice(0, 10) || "",
                        employmentType: data.employmentType || "FULL_TIME",
                        phone: data.phone || "",
                        backupPhone: data.backupPhone || "",
                        personalEmail: data.personalEmail || "",
                        address: data.address || "",
                    })
                }
            })
    }, [user.username])

    const submitProfile = async () => {
        setLoading(true)

        await fetch("/api/employees/profile", {
            method: "PUT", // allow update
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.username,
                ...form,
            }),
        })


        setLoading(false)
        onComplete()
    }

    return (
        <div className="max-w-xl mx-auto space-y-4 border rounded p-6">
            <h2 className="text-xl font-semibold">Complete Your Profile</h2>

            {Object.entries(form).map(([key, value]) => (
                key !== "employmentType" ? (
                    <input
                        key={key}
                        value={value}
                        onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                        }
                        placeholder={key.replace(/([A-Z])/g, " $1")}
                        className="w-full border rounded px-3 py-2"
                    />
                ) : null
            ))}

            <select
                value={form.employmentType}
                onChange={(e) =>
                    setForm({ ...form, employmentType: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
            >
                <option value="INTERN">Intern</option>
                <option value="FULL_TIME">Full Time</option>
            </select>

            <Button
                disabled={loading}
                onClick={submitProfile}
                className="w-full"
            >
                Save Profile
            </Button>
        </div>
    )
}

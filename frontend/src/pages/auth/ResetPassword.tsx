import { useState, type FormEvent } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import api from "@/axios/axios"
import { toast } from "sonner" // Ensure you import toast from sonner
import { Check, X, Loader2, AlertCircle } from "lucide-react"
// import { useAuth } from "./useAuth"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // const { logout } = useAuth()

  // Get token from URL
  const token = searchParams.get("token")

  const [pass, setPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [loading, setLoading] = useState(false)

  const validations = {
    "Min 8 chars": pass.length >= 8,
    Lowercase: /[a-z]/.test(pass),
    Uppercase: /[A-Z]/.test(pass),
    Number: /[0-9]/.test(pass),
    "Special Char": /[^A-Za-z0-9]/.test(pass),
  }

  const isValid = Object.values(validations).every(Boolean)

  // Helper to format date like: "Sunday, December 03, 2023 at 9:00 AM"
  const getFormattedDate = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (pass !== confirmPass) return toast.error("Passwords do not match")
    if (!token) return toast.error("Cannot submit: Missing token")

    setLoading(true)
    const res = await api
      .post("/auth/reset-password", {
        token,
        password: pass,
      })
      .catch((err) => err.response)

    setLoading(false)

    if (res?.status === 200) {
      toast("Password has been reset", {
        description: getFormattedDate(),
        action: {
          label: "Login",
          onClick: () => console.log("Undo clicked"),
        },
      })
     
      setTimeout(() => navigate("/login"), 2000)
    } else {
      const msg = res?.data?.message || "Link expired or invalid"
      toast.error(msg)
    }
  }

  // ❌ Error View (Invalid Token)
  if (!token) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl text-destructive">Invalid Link</CardTitle>
              <CardDescription>
                The password reset link is missing or invalid.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                Return to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ✅ Normal View (Reset Form)
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="New Password"
                  required
                />

                {/* Validation Grid */}
                <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/50 p-3">
                  {Object.entries(validations).map(([label, val]) => (
                    <div
                      key={label}
                      className={`flex items-center text-xs ${
                        val ? "text-green-600 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {val ? (
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <X className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {label}
                    </div>
                  ))}
                </div>

                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm Password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !isValid}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
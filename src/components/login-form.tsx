"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "./ui/password-input"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [identifierError, setIdentifierError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIdentifierError("")
    setPasswordError("")
    setGeneralError("")
    setSuccess("")

    if (!identifier) {
      setIdentifierError("Username or Telegram is required")
      return
    }
    if (!password) {
      setPasswordError("Password is required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error) {
          if (data.error.toLowerCase().includes("telegram") || data.error.toLowerCase().includes("username") || data.error.toLowerCase().includes("account")) setIdentifierError(data.error)
          else if (data.error.toLowerCase().includes("password")) setPasswordError(data.error)
          else setGeneralError(data.error)
        } else {
          setGeneralError("Login failed")
        }
      } else {
        setSuccess("Login successful! Redirecting...")
        setIdentifier("")
        setPassword("")
        router.push(data.redirectTo || '/')
        router.refresh()
      }
    } catch (err) {
      setGeneralError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
            {generalError && <p className="text-sm text-red-500 text-left my-2">{generalError}</p>}
            {success && <p className="text-sm text-green-600 text-left my-2">{success}</p>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="user-name">User name / Telegram account</Label>
                <Input
                  id="user-name"
                  type="text"
                  placeholder="example / @example"
                  required
                  className="focus-visible:ring-0"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
                {identifierError && <p className="text-sm text-red-500 mt-1">{identifierError}</p>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <PasswordInput
                  id="password"
                  autoComplete="password"
                  className="focus-visible:ring-0"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

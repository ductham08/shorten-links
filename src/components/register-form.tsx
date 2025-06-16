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

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [telegram, setTelegram] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Error states
  const [telegramError, setTelegramError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTelegramError("")
    setUsernameError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setGeneralError("")
    setSuccess("")

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      return
    }
    if (!telegram) {
      setTelegramError("Telegram ID is required")
      return
    }
    if (!username) {
      setUsernameError("Username is required")
      return
    }
    if (!password) {
      setPasswordError("Password is required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram, username, password })
      })
      const data = await res.json()
      if (!res.ok) {
        // Map errors to fields
        if (data.error) {
          if (data.error.includes("Telegram")) setTelegramError(data.error)
          else if (data.error.includes("Username")) setUsernameError(data.error)
          else if (data.error.toLowerCase().includes("password")) setPasswordError(data.error)
          else setGeneralError(data.error)
        } else {
          setGeneralError("Registration failed")
        }
      } else {
        setSuccess("Registration successful! You can now login.")
        setTelegram("")
        setUsername("")
        setPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      setGeneralError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="max-w-lg w-full mx-auto">
        <CardHeader>
          <CardTitle>Register to your account</CardTitle>
          <CardDescription>
            Enter your information below to register to your account
            {generalError && <p className="text-sm text-red-500 text-left my-2">{generalError}</p>}
            {success && <p className="text-sm text-green-600 text-left my-2">{success}</p>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-1.5">
                <Label htmlFor="telegram-id">Telegram account</Label>
                <Input
                  id="telegram-id"
                  type="text"
                  placeholder="@example"
                  className="focus-visible:ring-0"
                  value={telegram}
                  onChange={e => {
                    let value = e.target.value
                    if (!value.startsWith('@')) value = '@' + value.replace(/^@+/, '')
                    value = value.replace(/[^@a-zA-Z0-9_]/g, '')
                    value = '@' + value.slice(1).replace(/@/g, '')
                    setTelegram(value)
                  }}
                  required
                />
                {telegramError && <p className="text-sm text-red-500 mt-1">{telegramError}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="full-name">User name</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Cua"
                  required
                  className="focus-visible:ring-0"
                  value={username}
                  onChange={e => {
                    const filtered = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                    setUsername(filtered)
                  }}
                />
                {usernameError && <p className="text-sm text-red-500 mt-1">{usernameError}</p>}
              </div>

              <div className="grid gap-1.5">
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

              <div className="grid gap-1.5">
                <div className="flex items-center">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                </div>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="confirm-password"
                  className="focus-visible:ring-0"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPasswordError && <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>}
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

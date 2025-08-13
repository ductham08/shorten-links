"use client"

import { useState, useRef } from "react"
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
import { PasswordInput } from "@/components/ui/password-input"
import validator from "validator"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role] = useState("user")
  const [loading, setLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState<{
    text: string
    type: "error" | "success"
  } | null>(null)
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerMessage(null)

    // Validate inputs
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    }

    if (!name.trim()) newErrors.name = "Full name is required"
    else if (name.length < 2) newErrors.name = "Name must be at least 2 characters"

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validator.isEmail(email)) {
      newErrors.email = "Invalid email format"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)

    // Check for client-side errors
    const hasError = Object.values(newErrors).some((val) => val !== "")
    if (hasError) {
      // Focus on the first error field
      if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.focus()
      } else if (newErrors.email && emailInputRef.current) {
        emailInputRef.current.focus()
      } else if (newErrors.password && passwordInputRef.current) {
        passwordInputRef.current.focus()
      } else if (newErrors.confirmPassword && confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.focus()
      }
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerMessage({
          text: data.error || "Registration failed",
          type: "error",
        })
        return
      }

      // Handle successful registration
      setServerMessage({
        text: data.message || "Registration successful!",
        type: "success",
      })
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      // Store tokens and redirect to dashboard
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setTimeout(() => {
          router.push("/login")
        }, 1000)
      }
    } catch (error) {
      setServerMessage({
        text: "An error occurred. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>
            Register to experience features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-5">
                <div className="grid gap-3">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    ref={nameInputRef}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    ref={emailInputRef}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    ref={passwordInputRef}
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">
                    Confirm Password *
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    ref={confirmPasswordInputRef}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    "Register"
                  )}
                </Button>

                {serverMessage && (
                  <p
                    className={cn(
                      "text-sm text-center mt-2",
                      serverMessage.type === "error"
                        ? "text-red-500"
                        : "text-green-600"
                    )}
                  >
                    {serverMessage.text}
                  </p>
                )}
              </div>

              <div className="text-center text-sm">
                You already have an account?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  )
}
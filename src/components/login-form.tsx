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
import { useState, useRef } from "react"
import { PasswordInput } from "./ui/password-input"
import validator from "validator"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Reset server message
    setServerMessage(null)

    // Validate inputs
    const newErrors = {
      email: '',
      password: '',
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validator.isEmail(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)

    // Check for client-side errors
    const hasError = Object.values(newErrors).some((val) => val !== '')
    if (hasError) {
      // Focus on the first error field
      if (newErrors.email && emailInputRef.current) {
        emailInputRef.current.focus()
      } else if (newErrors.password && passwordInputRef.current) {
        passwordInputRef.current.focus()
      }
      return
    }

    setLoading(true)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        setServerMessage({ text: 'Login successful!', type: 'success' })
      } else {
        setServerMessage({ text: result.error || 'An error occurred. Please try again.', type: 'error' })
      }
    } catch (error) {
      setServerMessage({ text: 'An error occurred. Please try again.', type: 'error' })
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
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
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
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <PasswordInput
                  autoComplete="new-password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  ref={passwordInputRef}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>

                {serverMessage && (
                  <p
                    className={cn(
                      'text-sm text-left mt-2',
                      serverMessage.type === 'error'
                        ? 'text-red-500'
                        : 'text-green-600'
                    )}
                  >
                    {serverMessage.text}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useRouter } from 'next/navigation';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role] = useState('user')
  const router = useRouter();

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerMessage(null) // Clear previous messages

    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }

    // FE validation
    if (!name.trim()) newErrors.name = 'Full name is required'
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required'
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)

    const hasError = Object.values(newErrors).some((val) => val !== '')
    if (hasError) return

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      router.push('/dashboard');

      if (!response.ok) {
        setServerMessage({ text: data.message || 'Registration failed', type: 'error' })
      } else {
        setServerMessage({ text: data.message || 'Registration successful!', type: 'success' })
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }

    } catch (error) {
      setServerMessage({ text: 'An error occurred. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Register to experience features</CardDescription>
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
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
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
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm the password *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>

                {/* Message Display */}
                {serverMessage && (
                  <p
                    className={cn(
                      'text-sm text-center mt-2',
                      serverMessage.type === 'error'
                        ? 'text-red-500'
                        : 'text-green-600'
                    )}
                  >
                    {serverMessage.text}
                  </p>
                )}
              </div>

              <div className="text-center text-sm">
                You already have an account?{' '}
                <a href="/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{' '}
        <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

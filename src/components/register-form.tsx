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

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="max-w-lg w-full mx-auto">
        <CardHeader>
          <CardTitle>Register to your account</CardTitle>
          <CardDescription>
            Enter your information below to register to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">

              <div className="grid gap-3">
                <Label htmlFor="telegram-id">Telegram ID</Label>
                <Input
                  id="telegram-id"
                  type="text"
                  placeholder="@example"
                  className="focus-visible:ring-0"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="full-name">User name</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Cua"
                  required
                  className="focus-visible:ring-0"
                />
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
              </div>

              <div className="grid gap-3">
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
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

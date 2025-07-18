import { RegisterForm } from '@/components/register-form'
import React from 'react'

const RegisterPage = () => {
    const handleRegister = (data: any) => {
        console.log("data", data)
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <RegisterForm />
            </div>
        </div>
    )
}

export default RegisterPage

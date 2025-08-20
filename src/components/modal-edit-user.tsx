"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface User {
    _id: string
    name: string
    email: string
    role: string
}

interface ModalEditUserProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    userId: string
    currentUser: User
}

export function ModalEditUser({
    isOpen,
    onClose,
    onSuccess,
    userId,
    currentUser
}: ModalEditUserProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('accessToken')
            if (!token) {
                toast.error('No access token found')
                return
            }

            const response = await fetch(`/api/admin/users/edit?id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success('User updated successfully')
                onSuccess()
                onClose()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update user')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter name"
                            required
                            disabled={true}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            disabled={true}
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className='w-full'>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState, useEffect } from 'react'
import { IconDots, IconChevronDown, IconChevronLeft, IconChevronRight, IconArrowsUpDown } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Loading from './ui/loading'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ModalEditUser } from './modal-edit-user'

interface User {
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
}

interface AdminUsersTableProps {
    className?: string
}

export function AdminUsersTable({ className }: AdminUsersTableProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [filterValue, setFilterValue] = useState('')
    const [sortConfig, setSortConfig] = useState<{
        key: keyof User
        direction: 'asc' | 'desc'
    }>({ key: 'createdAt', direction: 'desc' })
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    })
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const [userToEdit, setUserToEdit] = useState<User | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [pagination.page, pagination.pageSize, sortConfig])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('accessToken')
            if (!token) {
                console.error('No access token found')
                return
            }

            const params = new URLSearchParams({
                page: pagination.page.toString(),
                pageSize: pagination.pageSize.toString(),
                sortBy: sortConfig.key,
                sortDir: sortConfig.direction,
            })

            const response = await fetch(`/api/admin/users/get?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUsers(data.items)
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages,
                }))
            } else if (response.status === 401) {
                console.error('Unauthorized - token may be expired')
                toast.error('Unauthorized access')
            } else if (response.status === 403) {
                console.error('Forbidden - not an admin')
                toast.error('Admin access required')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (key: keyof User) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(users.map(user => user._id))
        } else {
            setSelectedRows([])
        }
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id])
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id))
        }
    }

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
        setSelectedRows([])
    }

    const filteredUsers = users.filter(user => {
        const searchTerm = filterValue.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user)
        setShowDeleteAlert(true)
    }

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`/api/admin/users/delete?id=${userToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setShowDeleteAlert(false)
            setUserToDelete(null)
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with filter and columns */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter users..."
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="w-64"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUsers}
                        className="ml-auto"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedRows.length === users.length && users.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    {sortConfig.key === 'name' && (
                                        <IconArrowsUpDown size={14} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('email')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Email</span>
                                    {sortConfig.key === 'email' && (
                                        <IconArrowsUpDown size={14} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('role')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Role</span>
                                    {sortConfig.key === 'role' && (
                                        <IconArrowsUpDown size={14} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created At</span>
                                    {sortConfig.key === 'createdAt' && (
                                        <IconArrowsUpDown size={14} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loading size="sm" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="text-muted-foreground">No users found</div>
                                            <div className="text-sm text-muted-foreground">
                                                {filterValue ? 'Try adjusting your search terms' : 'No users available'}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRows.includes(user._id)}
                                                onCheckedChange={(checked) =>
                                                    handleSelectRow(user._id, checked as boolean)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <IconDots className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setUserToEdit(user)
                                                        setShowEditModal(true)
                                                    }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteClick(user)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer with pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div>
                        {selectedRows.length} of {filteredUsers.length} row(s) selected
                    </div>
                    <div>•</div>
                    <div>
                        Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} users
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <IconChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            Next
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user{' '}
                            <span className="font-medium text-red-500">{userToDelete?.email}</span> and all their data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-500 text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {userToEdit && (
                <ModalEditUser
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setUserToEdit(null)
                    }}
                    onSuccess={fetchUsers}
                    userId={userToEdit._id}
                    currentUser={userToEdit}
                />
            )}
        </div>
    )
}

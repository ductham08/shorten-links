"use client"

import { useState, useEffect } from 'react'
import { IconDots, IconChevronDown, IconChevronLeft, IconChevronRight, IconArrowsUpDown  } from '@tabler/icons-react'
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
import { ModalEditLink } from './modal-edit-link'
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

interface ShortLink {
    _id: string
    slug: string
    url: string
    title: string
    description: string
    image: string
    clicks: number
    createdAt: string
    updatedAt: string
    userId: string
    userEmail: string
    userName: string
}

interface AdminLinksTableProps {
    className?: string
}

export function AdminLinksTable({ className }: AdminLinksTableProps) {
    const [links, setLinks] = useState<ShortLink[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [filterValue, setFilterValue] = useState('')
    const [sortConfig, setSortConfig] = useState<{
        key: keyof ShortLink
        direction: 'asc' | 'desc'
    }>({ key: 'createdAt', direction: 'desc' })
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    })
    const [linkToDelete, setLinkToDelete] = useState<ShortLink | null>(null)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const [linkToEdit, setLinkToEdit] = useState<ShortLink | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        fetchLinks()
    }, [pagination.page, pagination.pageSize, sortConfig])

    const fetchLinks = async () => {
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

            const response = await fetch(`/api/admin/links/get?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setLinks(data.items)
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
            console.error('Error fetching links:', error)
            toast.error('Failed to fetch links')
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (key: keyof ShortLink) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(links.map(link => link._id))
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

    const filteredLinks = links.filter(link => {
        const searchTerm = filterValue.toLowerCase();
        return (
            (link.url || '').toLowerCase().includes(searchTerm) ||
            (link.slug || '').toLowerCase().includes(searchTerm) ||
            (link.title || '').toLowerCase().includes(searchTerm) ||
            (link.userEmail || '').toLowerCase().includes(searchTerm) ||
            (link.userName || '').toLowerCase().includes(searchTerm)
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

    const truncateUrl = (url: string, maxLength: number = 40) => {
        if (url.length <= maxLength) return url
        return url.substring(0, maxLength) + '...'
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Copied!', {
                duration: 1500,
            })
        } catch (err) {
            console.error('Failed to copy:', err)
            toast.error('Failed to copy to clipboard')
        }
    }

    const getFullShortLink = (slug: string) => {
        return `${window.location.origin}/${slug}`
    }

    const handleDeleteClick = (link: ShortLink) => {
        setLinkToDelete(link)
        setShowDeleteAlert(true)
    }

    const handleDeleteConfirm = async () => {
        if (!linkToDelete) return

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`/api/admin/links/delete?id=${linkToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('Link deleted successfully');
                fetchLinks(); // Refresh the list
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete link');
            }
        } catch (error) {
            console.error('Error deleting link:', error);
            toast.error('Failed to delete link');
        } finally {
            setShowDeleteAlert(false)
            setLinkToDelete(null)
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with filter and columns */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter links or users..."
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="w-64"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLinks}
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
                                    checked={selectedRows.length === links.length && links.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('url')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>URL</span>
                                    {sortConfig.key === 'url' && (
                                        <IconArrowsUpDown size={14} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('slug')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Slug</span>
                                    {sortConfig.key === 'slug' && (
                                        <IconArrowsUpDown size={11} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('userName')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>User name</span>
                                    {sortConfig.key === 'userName' && (
                                        <IconArrowsUpDown size={11} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('userEmail')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Email</span>
                                    {sortConfig.key === 'userEmail' && (
                                        <IconArrowsUpDown size={11} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 text-center"
                                onClick={() => handleSort('clicks')}
                            >
                                <div className="flex items-center justify-center space-x-1">
                                    <span>Clicks</span>
                                    {sortConfig.key === 'clicks' && (
                                        <IconArrowsUpDown size={11} />
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
                                        <IconArrowsUpDown size={11} />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loading size="sm" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLinks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="text-muted-foreground">No links found</div>
                                            <div className="text-sm text-muted-foreground">
                                                {filterValue ? 'Try adjusting your search terms' : 'No links available'}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLinks.map((link) => (
                                    <TableRow key={link._id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRows.includes(link._id)}
                                                onCheckedChange={(checked) =>
                                                    handleSelectRow(link._id, checked as boolean)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <div className="font-medium">{getFullShortLink(link.slug)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {truncateUrl(link.url)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">
                                                {link.slug}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {link.userName}
                                        </TableCell>
                                        <TableCell>
                                            {link.userEmail}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-center">{link.clicks}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(link.createdAt)}
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
                                                    <DropdownMenuItem onClick={() => copyToClipboard(getFullShortLink(link.slug))}>
                                                        Copy Link
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(getFullShortLink(link.slug), '_blank')}>
                                                        Open
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(link.url, '_blank')}>
                                                        Open Original
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setLinkToEdit(link)
                                                        setShowEditModal(true)
                                                    }}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteClick(link)}
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
                <div className="text-sm text-muted-foreground">
                    {selectedRows.length} of {filteredLinks.length} row(s) selected
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
                        <AlertDialogTitle>Are you sure you want to delete this link?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the short link{' '}
                            <span className="font-medium text-red-500">{window.location.origin}/{linkToDelete?.slug}</span> and all its data.
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

            {linkToEdit && (
                <ModalEditLink
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setLinkToEdit(null)
                    }}
                    onSuccess={fetchLinks}
                    linkId={linkToEdit._id}
                    currentUrl={linkToEdit.url}
                />
            )}
        </div>
    )
}

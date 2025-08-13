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
}

interface LinksTableProps {
    className?: string
}

export function LinksTable({ className }: LinksTableProps) {
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

            const response = await fetch(`/api/links/get?${params}`, {
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
                // You might want to redirect to login here
            }
        } catch (error) {
            console.error('Error fetching links:', error)
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

    const filteredLinks = links.filter(link =>
        link.url.toLowerCase().includes(filterValue.toLowerCase()) ||
        link.slug.toLowerCase().includes(filterValue.toLowerCase()) ||
        link.title.toLowerCase().includes(filterValue.toLowerCase())
    )

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with filter and columns */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter links..."
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
                                        sortConfig.direction === 'asc' ?
                                            <IconArrowsUpDown size={14} /> : <IconArrowsUpDown size={14} /> 
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
                                        sortConfig.direction === 'asc' ?
                                            <IconArrowsUpDown size={11} /> : <IconArrowsUpDown size={11} /> 
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
                                        sortConfig.direction === 'asc' ?
                                            <IconArrowsUpDown size={11} /> : <IconArrowsUpDown size={11} /> 
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
                                        sortConfig.direction === 'asc' ?
                                            <IconArrowsUpDown size={11} /> : <IconArrowsUpDown size={11} /> 
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
                            filteredLinks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="text-muted-foreground">No links found</div>
                                            <div className="text-sm text-muted-foreground">
                                                {filterValue ? 'Try adjusting your search terms' : 'Create your first short link to get started'}
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
                                                <div className="font-medium">{link.title || 'Untitled'}</div>
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
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
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
    )
}

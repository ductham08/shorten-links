"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ModalEditLinkProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    linkId: string
    currentUrl: string
}

export function ModalEditLink({
    isOpen,
    onClose,
    onSuccess,
    linkId,
    currentUrl
}: ModalEditLinkProps) {
    const [url, setUrl] = useState(currentUrl)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            const response = await fetch(`/api/links/edit?id=${linkId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ url }),
            })

            if (response.ok) {
                toast.success('Link updated successfully')
                onSuccess()
                onClose()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update link')
            }
        } catch (error) {
            console.error('Error updating link:', error)
            toast.error('Failed to update link')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Link</DialogTitle>
                        <DialogDescription>
                            Update the original URL for this short link.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="url">Original URL</Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !url.trim()}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

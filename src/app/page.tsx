"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { toast } from "sonner"

export default function Page() {
    const [url, setUrl] = useState("")
    const [shortUrl, setShortUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/shorten", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ longUrl: url }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            setShortUrl(data.shortUrl)
            toast.success("URL shortened successfully!", {
                duration: 1000,
                position: "top-right"
            })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to shorten URL")
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl)
            toast.success("Copied to clipboard!", {
                duration: 1000,
                position: "top-right"
            })
        } catch (error) {
            console.log(error);

            toast.error("Failed to copy to clipboard", {
                duration: 1000,
                position: "top-right"
            })
        }
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 62)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader path="Shortener Url" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="p-4">
                            <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter your url"
                                    className="focus-visible:ring-0"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Shortening..." : "Shorten"}
                                </Button>
                            </form>

                            {shortUrl && (
                                <div className="mt-4 flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={shortUrl}
                                        readOnly
                                        className="focus-visible:ring-0"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={copyToClipboard}
                                        className="cursor-pointer"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { NextResponse } from "next/server"
import { useState } from "react"
import { toast } from "sonner"

export default function Page() {
    const [url, setUrl] = useState("")
    const [shortUrl, setShortUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [alias, setAlias] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/shorten", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ longUrl: url, alias }),
            })

            const data = await response.json()

            if (response.status === 401) {
                toast.error(data.error, {
                    duration: 1000,
                    position: "top-right"
                })

                setTimeout(() => {
                    window.location.href = "/login"
                }, 1000)

                return
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
                        <div className="p-4 flex flex-col items-stretch gap-4">
                            <form onSubmit={handleSubmit} className="flex w-full flex-row gap-4">
                                <div className="w-full max-w-sm flex flex-col gap-2">
                                    <Label htmlFor="url">Long Url</Label>
                                    <Input
                                        id="url"
                                        type="text"
                                        placeholder="Enter long url"
                                        className="focus-visible:ring-0"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-end w-full max-w-sm place-content-between gap-2">
                                    <div className="w-full flex flex-col gap-2">
                                        <Label htmlFor="alias">Custom Alias (Optional)</Label>
                                        <Input
                                            id="alias"
                                            type="text"
                                            placeholder="Custom alias"
                                            className="focus-visible:ring-0"
                                            value={alias}
                                            onChange={(e) => setAlias(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Shortening..." : "Shorten"}
                                    </Button>
                                </div>
                            </form>

                            {shortUrl && (
                                <div className="flex items-center gap-2 w-full max-w-2xl">
                                    <Input
                                        type="text"
                                        value={shortUrl}
                                        readOnly
                                        disabled
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

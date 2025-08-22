import { Card, CardContent, CardHeader, CardTitle } from "./card"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LinkPreviewProps {
  title?: string
  description?: string
  image?: string
  className?: string
  isLoading?: boolean
}

export function LinkPreview({
  title = "No title",
  description = "No description",
  image,
  className,
  isLoading,
}: LinkPreviewProps) {
  return (
    <Card className={cn("w-full max-w-md overflow-hidden", className,)}>
      <CardHeader>
        <CardTitle>Url preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="relative flex h-32 items-center justify-center rounded-md bg-muted">
            {isLoading ? (
              <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
            ) : image ? (
              <Image
                src={image}
                alt="Link preview"
                fill
                className="rounded-md object-cover w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Image
                  src="/file.svg"
                  alt="Default preview"
                  width={48}
                  height={48}
                  className="opacity-50"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1">
            {isLoading ? (
              <>
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-full bg-muted animate-pulse rounded"></div>
              </>
            ) : (
              <>
                <h3 className="font-medium leading-none tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

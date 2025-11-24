"use client"

import { ZoomInIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"

interface ImagePreviewProps {
  src: string
  alt: string
  className?: string
}

export default function ImagePreview({
  src,
  alt,
  className,
}: ImagePreviewProps) {
  return (
    <div
      className={cn(
        "group relative size-full min-h-52 overflow-hidden rounded-lg border",
        className
      )}>
      <Image
        alt={alt}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        src={src}
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        )}
      />
      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="h-9 w-9 p-0"
              size="sm"
              type="button"
              variant="secondary">
              <ZoomInIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl border-0 p-0">
            <DialogTitle className="sr-only">Preview</DialogTitle>
            <div className="relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent shadow-md">
              <Image
                alt={alt}
                className="h-full w-full object-contain"
                fill
                src={src}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

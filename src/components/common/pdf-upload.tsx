"use client"

import {
  AlertCircleIcon,
  FileTextIcon,
  FileUpIcon,
  Trash2Icon,
  XIcon,
  ZoomInIcon,
} from "lucide-react"
import { createContext, useContext, useId } from "react"

import {
  type FileUploadActions,
  type FileUploadState,
  type FileWithPreview,
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"

const PdfUploadContext = createContext<{
  id?: string
  fileState: FileUploadState
  fileActions: FileUploadActions
  maxSizeMB: number
  multiple: boolean
  onFileRemoved?: (file: FileWithPreview) => void
  "aria-invalid"?: boolean
}>(null!)

interface PdfUploadProps {
  id?: string
  files?: FileWithPreview[]
  defaultFiles?: string[]
  className?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  onFilesAdded?: (files: FileWithPreview[]) => void
  onFileRemoved?: (file: FileWithPreview) => void
  onAllFilesRemoved?: () => void
  "aria-invalid"?: boolean
}

export function PdfUpload({
  id,
  files,
  defaultFiles,
  className,
  multiple = false,
  maxFiles,
  maxSizeMB = 5,
  onFilesAdded,
  onFileRemoved,
  onAllFilesRemoved,
  "aria-invalid": ariaInvalid,
  children,
}: React.PropsWithChildren<PdfUploadProps>) {
  const vId = useId()
  const maxSize = maxSizeMB * 1024 * 1024

  const [fileState, fileActions] = useFileUpload({
    accept: "application/pdf",
    maxSize,
    multiple,
    maxFiles,
    onFilesAdded,
    files,
    defaultFiles: defaultFiles?.map((url, i) => ({
      id: `${vId}-${url}-${i}`,
      file: {
        id: `${vId}-${url}-${i}`,
        name: url,
        type: "application/pdf",
        size: 0,
        url,
      },
      preview: url,
    })),
  })

  return (
    <PdfUploadContext.Provider
      value={{
        id,
        fileState,
        fileActions,
        maxSizeMB,
        multiple,
        onFileRemoved,
        "aria-invalid": ariaInvalid,
      }}>
      <div className={cn("flex flex-col gap-2", className)}>
        {children}

        {fileState.errors.length > 0 ? (
          <div
            className="flex items-center gap-1 text-destructive text-xs"
            role="alert">
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{fileState.errors[0]}</span>
          </div>
        ) : null}

        {multiple && fileState.files.length > 0 ? (
          <div className="space-y-2">
            {fileState.files.map((file) => (
              <div
                className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
                key={file.id}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="aspect-square shrink-0 rounded bg-accent text-foreground">
                    {file.preview ? (
                      <embed
                        className="size-10 rounded-[inherit] object-cover"
                        src={file.preview}
                        type="application/pdf"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center">
                        <FileTextIcon className="size-4 opacity-60" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate font-medium text-[13px] text-foreground">
                      {file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  aria-label="Remove file"
                  className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                  onClick={() => {
                    fileActions.removeFile(file.id)
                    onFileRemoved?.(file)
                  }}
                  size="icon"
                  type="button"
                  variant="ghost">
                  <XIcon aria-hidden="true" />
                </Button>
              </div>
            ))}

            {/* Remove all files button */}
            {fileState.files.length > 1 ? (
              <div>
                <Button
                  className="text-foreground"
                  onClick={() => {
                    fileActions.clearFiles()
                    onAllFilesRemoved?.()
                  }}
                  size="sm"
                  type="button"
                  variant="outline">
                  Hapus semua pdf
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </PdfUploadContext.Provider>
  )
}

interface PdfUploadPreviewProps {
  ref?: React.Ref<HTMLDivElement>
  className?: string
  variant?: "default" | "destructive"
}

export function PdfUploadPreview({
  ref,
  className,
  variant = "default",
}: PdfUploadPreviewProps) {
  const pdfUploadContext = useContext(PdfUploadContext)

  if (!pdfUploadContext) {
    throw new Error(
      "PdfUploadPreview must be used within a PdfUpload component"
    )
  }

  const {
    id,
    fileState: { files, isDragging },
    fileActions: {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
    multiple,
    onFileRemoved,
    "aria-invalid": ariaInvalid,
  } = pdfUploadContext

  function handleRemoveFile() {
    if (files[0]) {
      removeFile(files[0].id)
      onFileRemoved?.(files[0])
    }
  }

  const previewUrl = files[0]?.preview || null

  if (!previewUrl || multiple) return null

  return (
    <div
      className="relative size-full"
      data-dragging={isDragging || undefined}
      onClick={(e) => {
        e.preventDefault()
        openFileDialog()
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={ref}
      role="button">
      <input
        id={id}
        {...getInputProps()}
        aria-invalid={ariaInvalid}
        aria-label="Upload pdf file"
        className="sr-only"
      />
      <div
        className={cn(
          "group relative size-full overflow-hidden rounded-lg border p-4",
          variant === "destructive" && "border-destructive",
          className
        )}>
        <div className="flex items-center gap-3">
          <div className="aspect-square shrink-0 rounded bg-muted text-foreground">
            <div className="flex size-16 items-center justify-center">
              <FileTextIcon className="size-4 opacity-60" />
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate font-medium text-foreground text-sm">
              {files[0]?.file.name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-xs">
                {formatBytes(files[0]?.file.size || 0)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100",
            isDragging && "opacity-40"
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
              <div className="relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent p-4 pt-12 shadow-md">
                <embed
                  className="h-full w-full rounded-[inherit] border object-contain"
                  src={previewUrl}
                  type="application/pdf"
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="h-9 w-9 p-0"
            onClick={handleRemoveFile}
            size="sm"
            type="button"
            variant="destructive">
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface PdfUploadDropAreaProps {
  ref?: React.Ref<HTMLDivElement>
  placeholder?: string
  className?: string
}

export function PdfUploadDropArea({
  ref,
  placeholder = "Seret pdf ke sini atau klik untuk unggah",
  className,
}: PdfUploadDropAreaProps) {
  const pdfUploadContext = useContext(PdfUploadContext)

  if (!pdfUploadContext) {
    throw new Error(
      "PdfUploadDropArea must be used within a PdfUpload component"
    )
  }

  const {
    id,
    fileState: { files, isDragging },
    fileActions: {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
    maxSizeMB,
    multiple,
    "aria-invalid": ariaInvalid,
  } = pdfUploadContext

  const previewUrl = files[0]?.preview || null

  if (!multiple && previewUrl) return null

  return (
    <div className="relative size-full">
      <div
        className={cn(
          ((!previewUrl && !multiple) || multiple) &&
            "relative flex size-full min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-[img]:border-solid has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[invalid=true]:border-destructive data-[dragging=true]:bg-accent/50 data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40",
          !multiple && previewUrl && "relative",
          className
        )}
        data-dragging={isDragging || undefined}
        data-invalid={ariaInvalid || undefined}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={ref}
        role="button">
        <input
          id={id}
          {...getInputProps()}
          aria-invalid={ariaInvalid}
          aria-label="Upload image file"
          className="sr-only"
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            aria-hidden="true"
            className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background">
            <FileUpIcon className="size-4 text-foreground opacity-60" />
          </div>
          <p className="mb-1.5 font-medium text-foreground text-sm">
            {placeholder}
          </p>
          <p className="text-muted-foreground text-xs">
            PDF (max. {maxSizeMB}MB)
          </p>
        </div>
      </div>
    </div>
  )
}

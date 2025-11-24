import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  ImageIcon,
  LucideAudioLines,
  Trash2Icon,
  VideoIcon,
  XIcon,
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
import type { SingleAudioAccept } from "./audio-upload"
import type { SingleImageAccept } from "./image-upload"
import type { SingleVideoAccept } from "./video-upload"

export type SingleFileAccept =
  | "*"
  | SingleImageAccept
  | SingleVideoAccept
  | SingleAudioAccept
  | "application/*"
  | "text/*"

  // Documents
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "text/plain"
  | "text/csv"
  | "application/rtf"

  // Archives
  | "application/zip"
  | "application/x-7z-compressed"
  | "application/x-rar-compressed"
  | "application/x-tar"
  | "application/gzip"

  // Code files
  | "application/javascript"
  | "application/json"
  | "text/html"
  | "text/css"
  | "application/xml"
  | "application/x-sh"
  | "text/x-python"
  | "text/markdown"
  | "text/x-java-source"
  | (string & {})

const mimeToLabel: Record<
  Exclude<
    SingleFileAccept,
    "*" | "image/*" | "video/*" | "audio/*" | "application/*" | "text/*"
  >,
  string
> = {
  "image/svg+xml": "SVG",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/jpg": "JPG",
  "image/webp": "WEBP",
  "image/gif": "GIF",
  "image/avif": "AVIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
  "image/heic": "HEIC",

  "video/mp4": "MP4",
  "video/webm": "WebM",
  "video/ogg": "OGG",
  "video/quicktime": "MOV",
  "video/x-msvideo": "AVI",
  "video/x-matroska": "MKV",
  "video/x-flv": "FLV",
  "video/x-ms-wmv": "WMV",
  "video/3gpp": "3GP",
  "video/x-m4v": "M4V",
  "video/mp2t": "TS",

  "audio/mpeg": "MP3",
  "audio/mp4": "M4A",
  "audio/wav": "WAV",
  "audio/ogg": "OGG",
  "audio/opus": "OPUS",
  "audio/aac": "AAC",
  "audio/flac": "FLAC",
  "audio/aiff": "AIFF",
  "audio/basic": "BASIC",
  "audio/midi": "MIDI",
  "audio/webm": "WEBM",

  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint",
  "text/plain": "Text",
  "text/csv": "CSV",
  "application/rtf": "RTF",

  "application/zip": "ZIP",
  "application/x-7z-compressed": "7Z",
  "application/x-rar-compressed": "RAR",
  "application/x-tar": "TAR",
  "application/gzip": "GZIP",

  "application/javascript": "JavaScript",
  "application/json": "JSON",
  "text/html": "HTML",
  "text/css": "CSS",
  "application/xml": "XML",
  "application/x-sh": "Shell Script",
  "text/x-python": "Python",
  "text/markdown": "Markdown",
  "text/x-java-source": "Java",
}

function formatAcceptLabel(accept: SingleFileAccept[]): string {
  const labels = accept.map((mime) => mimeToLabel[mime] ?? mime).filter(Boolean)

  // hapus duplikat & ubah koma terakhir jadi "atau"
  const unique = Array.from(new Set(labels))
  return unique.join(", ").replace(/, ([^,]*)$/, " atau $1")
}

function getFileIcon(file: { file: File | { type: string; name: string } }) {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <FileTextIcon className="size-4 opacity-60" />
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />
  } else if (fileType.includes("video/")) {
    return <VideoIcon className="size-4 opacity-60" />
  } else if (fileType.includes("audio/")) {
    return <LucideAudioLines className="size-4 opacity-60" />
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 opacity-60" />
  }
  return <FileIcon className="size-4 opacity-60" />
}

const FileUploadContext = createContext<{
  id?: string
  fileState: FileUploadState
  fileActions: FileUploadActions
  maxSizeMB: number
  multiple: boolean
  accept: SingleFileAccept[]
  onFileRemoved?: (file: FileWithPreview) => void
  "aria-invalid"?: boolean
}>(null!)

interface FileUploadProps {
  id?: string
  accept?: SingleFileAccept[]
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

export function FileUpload({
  id,
  accept = ["*"],
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
}: React.PropsWithChildren<FileUploadProps>) {
  const vId = useId()
  const maxSize = maxSizeMB * 1024 * 1024

  const [fileState, fileActions] = useFileUpload({
    accept: accept.join(","),
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
        type: "*",
        size: 0,
        url,
      },
      preview: url,
    })),
  })

  return (
    <FileUploadContext.Provider
      value={{
        id,
        fileState,
        fileActions,
        maxSizeMB,
        multiple,
        accept,
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
                  <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate font-medium text-[13px]">
                      {file.file instanceof File
                        ? file.file.name
                        : file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(
                        file.file instanceof File
                          ? file.file.size
                          : file.file.size
                      )}
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
                  variant="ghost">
                  <XIcon aria-hidden="true" className="size-4" />
                </Button>
              </div>
            ))}

            {/* Remove all files button */}
            {fileState.files.length > 1 ? (
              <div>
                <Button
                  onClick={() => {
                    fileActions.clearFiles()
                    onAllFilesRemoved?.()
                  }}
                  size="sm"
                  variant="outline">
                  Hapus semua berkas
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </FileUploadContext.Provider>
  )
}

interface FileUploadPreviewProps {
  ref?: React.Ref<HTMLDivElement>
  className?: string
  variant?: "default" | "destructive"
}

export function FileUploadPreview({
  ref,
  className,
  variant = "default",
}: FileUploadPreviewProps) {
  const fileUploadContext = useContext(FileUploadContext)

  if (!fileUploadContext) {
    throw new Error(
      "FileUploadPreview must be used within a FileUpload component"
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
  } = fileUploadContext

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
        aria-label="Upload file"
        className="sr-only"
      />
      <div
        className={cn(
          "group relative size-full overflow-hidden rounded-lg border",
          variant === "destructive" && "border-destructive",
          className
        )}>
        <div className="flex items-center justify-between gap-2 p-2 pe-3">
          <div className="aspect-square shrink-0 rounded bg-muted text-foreground">
            <div className="flex size-16 items-center justify-center">
              {files[0] ? (
                getFileIcon(files[0])
              ) : (
                <FileIcon className="size-4 opacity-60" />
              )}
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

interface FileUploadDropAreaProps {
  ref?: React.Ref<HTMLDivElement>
  placeholder?: string
  className?: string
}

export function FileUploadDropArea({
  ref,
  placeholder = "Seret berkas ke sini atau klik untuk unggah",
  className,
}: FileUploadDropAreaProps) {
  const fileUploadContext = useContext(FileUploadContext)

  if (!fileUploadContext) {
    throw new Error(
      "FileUploadDropArea must be used within a FileUpload component"
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
    accept,
    "aria-invalid": ariaInvalid,
  } = fileUploadContext

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
            {accept.includes("*") ? (
              <>max. {maxSizeMB}MB</>
            ) : (
              <>
                {formatAcceptLabel(accept)} (max. {maxSizeMB}MB)
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

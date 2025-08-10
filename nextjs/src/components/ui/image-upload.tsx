"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateImageFile, formatFileSize, IMAGE_CONFIG } from "@/lib/utils/image-validation"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove: () => void
  selectedImage?: File | null
  isUploading?: boolean
  className?: string
}

export function ImageUpload({
  onImageSelect,
  onImageRemove, 
  selectedImage,
  isUploading = false,
  className = ""
}: ImageUploadProps) {
  const [error, setError] = useState<string>("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setError("")
    
    const validation = validateImageFile(file)
    if (validation) {
      setError(validation.message)
      return
    }

    onImageSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setError("")
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedImage ? (
        <div className="relative">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedImage.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedImage.size)}
              </p>
            </div>
            
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeImage}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }
          `}
          onClick={openFileDialog}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop an image here or click to select</p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB • {IMAGE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_CONFIG.ALLOWED_TYPES.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
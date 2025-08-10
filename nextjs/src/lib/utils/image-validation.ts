// Image upload validation utilities for Supabase free tier (1GB limit)

export const IMAGE_CONFIG = {
  // Max file size: 5MB (conservative for free tier)
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  
  // Allowed image types
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const

export interface ImageValidationError {
  type: 'size' | 'type' | 'extension' | 'corrupted'
  message: string
}

export function validateImageFile(file: File): ImageValidationError | null {
  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_SIZE) {
    return {
      type: 'size',
      message: `Image size must be less than ${IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    }
  }

  // Check MIME type
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type as typeof IMAGE_CONFIG.ALLOWED_TYPES[number])) {
    return {
      type: 'type',
      message: `Invalid file type. Only ${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')} are allowed.`
    }
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!IMAGE_CONFIG.ALLOWED_EXTENSIONS.includes(extension as typeof IMAGE_CONFIG.ALLOWED_EXTENSIONS[number])) {
    return {
      type: 'extension', 
      message: `Invalid file extension. Only ${IMAGE_CONFIG.ALLOWED_EXTENSIONS.join(', ')} are allowed.`
    }
  }

  // Basic file corruption check (very basic - just check if it's not empty)
  if (file.size === 0) {
    return {
      type: 'corrupted',
      message: 'File appears to be corrupted or empty.'
    }
  }

  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateImagePath(userId: string, taskId: string, fileName: string): string {
  const timestamp = Date.now()
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${userId}/${taskId}/${timestamp}_${cleanFileName}`
}
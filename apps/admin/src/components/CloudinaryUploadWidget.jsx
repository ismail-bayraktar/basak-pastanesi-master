import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { mediaAPI } from '@/lib/api'

/**
 * CloudinaryUploadWidget - Direct upload to Cloudinary (Shopify-style)
 *
 * This component uploads files directly to Cloudinary from the browser,
 * bypassing the backend server for better performance and reliability.
 *
 * @param {Object} props
 * @param {string} props.folder - Cloudinary folder (default: 'tulumbak/general')
 * @param {Function} props.onUploadSuccess - Callback when upload succeeds
 * @param {Function} props.onUploadError - Callback when upload fails
 * @param {boolean} props.multiple - Allow multiple file selection
 * @param {number} props.maxFiles - Maximum number of files (default: 10)
 * @param {string} props.category - Media category for DB record
 * @param {string} props.accept - Accepted file types (default: 'image/*')
 */
const CloudinaryUploadWidget = ({
  folder = 'basak-pastanesi/general',
  onUploadSuccess,
  onUploadError,
  multiple = false,
  maxFiles = 10,
  category = 'general',
  accept = 'image/*',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  const uploadToCloudinary = async (file) => {
    try {
      // Step 1: Get signed upload parameters from backend
      const signatureResponse = await mediaAPI.getUploadSignature(folder)
      const { signature, timestamp, cloudName, apiKey } = signatureResponse.data

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp)
      formData.append('api_key', apiKey)
      formData.append('folder', folder)

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Cloudinary upload failed')
      }

      const cloudinaryResult = await response.json()

      // Step 3: Register in database
      const registerResponse = await mediaAPI.registerUpload({
        publicId: cloudinaryResult.public_id,
        url: cloudinaryResult.url,
        secureUrl: cloudinaryResult.secure_url,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        bytes: cloudinaryResult.bytes,
        resourceType: cloudinaryResult.resource_type,
        originalFilename: file.name,
        folder,
        category
      })

      return registerResponse.data.media
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files).slice(0, maxFiles)
    setUploading(true)
    setProgress(0)

    const results = []
    const errors = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]

      try {
        const media = await uploadToCloudinary(file)
        results.push(media)
        setUploadedFiles(prev => [...prev, media])
        setProgress(((i + 1) / fileArray.length) * 100)
      } catch (error) {
        errors.push({ filename: file.name, error: error.message })
        console.error(`Upload failed for ${file.name}:`, error)
      }
    }

    setUploading(false)
    setProgress(100)

    if (results.length > 0) {
      toast.success(`${results.length} dosya başarıyla yüklendi`)
      onUploadSuccess?.(multiple ? results : results[0])
    }

    if (errors.length > 0) {
      toast.error(`${errors.length} dosya yüklenemedi`)
      onUploadError?.(errors)
    }
  }, [folder, category, maxFiles, multiple, onUploadSuccess, onUploadError])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e) => {
    handleFiles(e.target.files)
    e.target.value = '' // Reset input
  }, [handleFiles])

  const removeUploadedFile = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('cloudinary-file-input')?.click()}
      >
        <input
          id="cloudinary-file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            <Progress value={progress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Dosya seçmek için tıklayın veya sürükleyip bırakın
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {multiple ? `Maksimum ${maxFiles} dosya` : 'Tek dosya'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Yüklenen Dosyalar</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.id || index}
                className="relative group rounded-lg overflow-hidden border"
              >
                <img
                  src={file.url}
                  alt={file.alt || file.filename}
                  className="w-full h-24 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeUploadedFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CloudinaryUploadWidget

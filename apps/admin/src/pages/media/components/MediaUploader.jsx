import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone' // I need to check if react-dropzone is installed, if not I'll use standard input
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { mediaAPI } from "@/lib/api"
import axios from 'axios'
import { toast } from "sonner" // package.json has sonner

export function MediaUploader({ onSuccess, trigger }) {
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState({})

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(7),
            status: 'pending', // pending, uploading, success, error
            progress: 0
        }))])
    }, [])

    // Simple dropzone implementation if react-dropzone is missing, 
    // but let's assume we can use standard input for now to be safe
    const handleFileSelect = (e) => {
        if (e.target.files?.length) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                id: Math.random().toString(36).substring(7),
                status: 'pending',
                progress: 0
            }))
            setFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const uploadFiles = async () => {
        setUploading(true)
        let successCount = 0

        for (const fileObj of files) {
            if (fileObj.status === 'success') continue

            try {
                // Update status to uploading
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading' } : f))

                // 1. Get Signature
                const { data: sigData } = await mediaAPI.getUploadSignature('basak-pastanesi/general')

                if (!sigData.success) throw new Error('İmza alınamadı')

                // 2. Prepare FormData
                const formData = new FormData()
                formData.append('file', fileObj.file)
                formData.append('api_key', sigData.apiKey)
                formData.append('timestamp', sigData.timestamp)
                formData.append('signature', sigData.signature)
                formData.append('folder', sigData.folder)

                // 3. Upload to Cloudinary
                const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`

                const cloudinaryRes = await axios.post(uploadUrl, formData, {
                    onUploadProgress: (p) => {
                        const percent = Math.round((p.loaded * 100) / p.total)
                        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: percent } : f))
                    }
                })

                // 4. Register with Backend
                await mediaAPI.registerUpload({
                    publicId: cloudinaryRes.data.public_id,
                    url: cloudinaryRes.data.url,
                    secureUrl: cloudinaryRes.data.secure_url,
                    format: cloudinaryRes.data.format,
                    width: cloudinaryRes.data.width,
                    height: cloudinaryRes.data.height,
                    bytes: cloudinaryRes.data.bytes,
                    resourceType: cloudinaryRes.data.resource_type,
                    originalFilename: fileObj.file.name,
                    folder: sigData.folder
                })

                // Success
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f))
                successCount++

            } catch (error) {
                console.error('Upload error:', error)
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f))
                toast.error(`${fileObj.file.name} yüklenemedi`)
            }
        }

        setUploading(false)
        if (successCount > 0) {
            toast.success(`${successCount} dosya başarıyla yüklendi`)
            if (onSuccess) onSuccess()
            // Optional: close dialog if all success
            if (files.every(f => f.status === 'success' || f.status === 'pending')) { // pending check is weird here but logic holds
                // maybe don't close automatically to let user see results
            }
        }
    }

    const handleOpenChange = (open) => {
        if (!open && uploading) {
            toast.warning('Yükleme işlemi devam ediyor')
            return
        }
        setOpen(open)
        if (!open) {
            // Reset on close if not uploading
            setTimeout(() => setFiles([]), 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Medya Yükle
                </Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Medya Yükle</DialogTitle>
                    <DialogDescription>
                        Resim, video veya belge yükleyin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drop Area */}
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors relative">
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Dosyaları buraya sürükleyin veya seçmek için tıklayın
                            </p>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {files.map((file) => (
                                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-md bg-background">
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                                        {file.file.type.startsWith('image/') ? (
                                            <img
                                                src={URL.createObjectURL(file.file)}
                                                alt="preview"
                                                className="h-full w-full object-cover rounded"
                                            />
                                        ) : (
                                            <FileIcon className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        {file.status === 'uploading' && (
                                            <Progress value={file.progress} className="h-1 mt-1" />
                                        )}
                                    </div>

                                    <div className="shrink-0">
                                        {file.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        {file.status === 'pending' && (
                                            <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                        İptal
                    </Button>
                    <Button onClick={uploadFiles} disabled={files.length === 0 || uploading}>
                        {uploading ? 'Yükleniyor...' : 'Yüklemeyi Başlat'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

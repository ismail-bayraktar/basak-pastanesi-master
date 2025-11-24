import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ImageIcon,
  Search,
  Upload,
  X,
  Check,
  CloudUpload,
  FolderOpen,
  FileText,
  Loader2
} from "lucide-react"
import { mediaAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Categories for filtering
const CATEGORIES = [
  { value: "all", label: "Tümü", icon: FolderOpen },
  { value: "products", label: "Ürünler", icon: ImageIcon },
  { value: "sliders", label: "Slider/Banner", icon: ImageIcon },
  { value: "categories", label: "Kategoriler", icon: FolderOpen },
  { value: "general", label: "Genel", icon: FolderOpen },
]

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  category = "all",
  title = "Medya Seç",
  description = "Kütüphaneden görsel seçin veya yeni yükleyin"
}) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("library")
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [selectedMedia, setSelectedMedia] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    pages: 0
  })

  // Fetch media
  const fetchMedia = useCallback(async () => {
    if (!open) return

    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const response = await mediaAPI.getAll(params)

      if (response.data.success) {
        setMedia(response.data.media)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching media:", error)
      toast({
        title: "Hata",
        description: "Medya listesi yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [open, pagination.page, pagination.limit, selectedCategory, searchQuery, toast])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Reset selection when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedMedia([])
      setSearchQuery("")
    }
  }, [open])

  // Handle media selection
  const handleSelect = (item) => {
    if (multiple) {
      setSelectedMedia(prev => {
        const isSelected = prev.some(m => m.id === item._id || m.id === item.id)
        if (isSelected) {
          return prev.filter(m => m.id !== item._id && m.id !== item.id)
        }
        return [...prev, {
          id: item._id || item.id,
          url: item.secureUrl || item.url,
          alt: item.alt || item.originalName,
          title: item.title || item.originalName,
          responsive: item.responsive
        }]
      })
    } else {
      const selected = {
        id: item._id || item.id,
        url: item.secureUrl || item.url,
        alt: item.alt || item.originalName,
        title: item.title || item.originalName,
        responsive: item.responsive
      }
      onSelect(selected)
      onOpenChange(false)
    }
  }

  // Confirm multiple selection
  const handleConfirmSelection = () => {
    if (selectedMedia.length > 0) {
      onSelect(selectedMedia)
      onOpenChange(false)
    }
  }

  // Check if item is selected
  const isSelected = (item) => {
    return selectedMedia.some(m => m.id === item._id || m.id === item.id)
  }

  // Handle file upload
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("category", selectedCategory !== "all" ? selectedCategory : "general")
        formData.append("folder", selectedCategory !== "all" ? selectedCategory : "general")

        await mediaAPI.upload(formData)
      }

      toast({
        title: "Başarılı",
        description: `${files.length} dosya yüklendi`,
      })

      // Refresh media list
      fetchMedia()
      setActiveTab("library")
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Yükleme hatası",
        description: error.response?.data?.message || "Dosya yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Get image URL with fallback
  const getImageUrl = (item) => {
    return item.responsive?.thumbnail || item.secureUrl || item.url
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="library">
              <FolderOpen className="w-4 h-4 mr-2" />
              Kütüphane
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Yükle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col mt-4">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-1">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-4" />
                  <p>Medya bulunamadı</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {media.map((item) => (
                    <div
                      key={item._id || item.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                        isSelected(item) ? "border-primary ring-2 ring-primary" : "border-transparent"
                      }`}
                      onClick={() => handleSelect(item)}
                    >
                      <img
                        src={getImageUrl(item)}
                        alt={item.alt || item.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected(item) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          {item.originalName || item.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {pagination.total} medya
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col mt-4">
            <div
              className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                uploading ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium">Yükleniyor...</p>
                </>
              ) : (
                <>
                  <CloudUpload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Dosyaları buraya sürükleyin</p>
                  <p className="text-sm text-muted-foreground mb-4">veya</p>
                  <Button variant="outline" onClick={() => document.getElementById("picker-upload").click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Dosya Seç
                  </Button>
                  <input
                    id="picker-upload"
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-4">
                    JPG, PNG, GIF, WebP - Maks 50MB
                  </p>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer with selection info and confirm button */}
        {multiple && selectedMedia.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedMedia.length} seçili</Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMedia([])}>
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            </div>
            <Button onClick={handleConfirmSelection}>
              <Check className="h-4 w-4 mr-2" />
              Seçimi Onayla
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Convenience component for single image field
export function MediaPickerButton({
  value,
  onChange,
  category = "products",
  placeholder = "Görsel Seç",
  className = ""
}) {
  const [open, setOpen] = useState(false)

  const handleSelect = (media) => {
    onChange(media)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <>
      <div
        className={`relative border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors ${className}`}
        onClick={() => setOpen(true)}
      >
        {value?.url ? (
          <div className="relative aspect-video">
            <img
              src={value.responsive?.thumbnail || value.url}
              alt={value.alt || "Selected image"}
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-sm">{placeholder}</span>
          </div>
        )}
      </div>

      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        category={category}
        title="Görsel Seç"
        description="Ürün için görsel seçin veya yeni yükleyin"
      />
    </>
  )
}

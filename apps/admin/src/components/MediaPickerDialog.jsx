import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Image as ImageIcon,
  Check,
  Upload,
  FolderOpen,
  Loader2,
  X
} from "lucide-react"
import { mediaAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

/**
 * MediaPickerDialog - Shopify-style media picker for selecting images from library
 * @param {boolean} open - Dialog open state
 * @param {function} onOpenChange - Dialog open state change handler
 * @param {function} onSelect - Callback when media is selected (receives array of media objects)
 * @param {boolean} multiple - Allow multiple selection (default: true)
 * @param {number} maxSelection - Maximum number of selections (default: 4)
 * @param {array} initialSelection - Initially selected media IDs
 * @param {string} category - Filter by category (e.g., 'product', 'slider')
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  multiple = true,
  maxSelection = 4,
  initialSelection = [],
  category = "all"
}) {
  const { toast } = useToast()
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [selectedMedia, setSelectedMedia] = useState(new Set(initialSelection))
  const [activeTab, setActiveTab] = useState("library")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Fetch media from library
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy: "createdAt",
        sortOrder: "desc"
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
  }, [pagination.page, pagination.limit, selectedCategory, searchQuery, toast])

  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open, fetchMedia])

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedMedia(new Set(initialSelection))
    }
  }, [open, initialSelection])

  // Handle media selection
  const handleSelectMedia = (mediaItem) => {
    const newSelection = new Set(selectedMedia)

    if (newSelection.has(mediaItem._id)) {
      newSelection.delete(mediaItem._id)
    } else {
      if (!multiple) {
        newSelection.clear()
      }
      if (newSelection.size < maxSelection) {
        newSelection.add(mediaItem._id)
      } else {
        toast({
          title: "Limit Aşıldı",
          description: `En fazla ${maxSelection} görsel seçebilirsiniz`,
          variant: "destructive",
        })
        return
      }
    }

    setSelectedMedia(newSelection)
  }

  // Handle confirm selection
  const handleConfirm = () => {
    const selectedItems = media.filter(item => selectedMedia.has(item._id))
    onSelect(selectedItems)
    onOpenChange(false)
  }

  // Get image URL (handle both Cloudinary and local)
  const getImageUrl = (mediaItem) => {
    return mediaItem.secureUrl || mediaItem.url || '/placeholder.png'
  }

  // Categories for filter
  const categories = [
    { value: "all", label: "Tümü" },
    { value: "product", label: "Ürünler" },
    { value: "slider", label: "Slider" },
    { value: "general", label: "Genel" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Medya Kütüphanesi
          </DialogTitle>
          <DialogDescription>
            Görsel seçin veya yeni görsel yükleyin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
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
            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                {categories.map((cat) => (
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

            {/* Selection Info */}
            {selectedMedia.size > 0 && (
              <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-md">
                <span className="text-sm">
                  {selectedMedia.size} görsel seçildi
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMedia(new Set())}
                >
                  <X className="w-4 h-4 mr-1" />
                  Temizle
                </Button>
              </div>
            )}

            {/* Media Grid */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p>Medya bulunamadı</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {media.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectMedia(item)}
                      className={`
                        relative aspect-square rounded-lg overflow-hidden cursor-pointer
                        border-2 transition-all hover:border-primary
                        ${selectedMedia.has(item._id)
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent'
                        }
                      `}
                    >
                      <img
                        src={getImageUrl(item)}
                        alt={item.alt || item.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Selection Indicator */}
                      {selectedMedia.has(item._id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* File Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5">
                        <p className="text-white text-xs truncate">
                          {item.originalName || item.filename}
                        </p>
                      </div>

                      {/* Usage Badge */}
                      {item.usedIn && item.usedIn.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs"
                        >
                          Kullanılıyor
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Önceki
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Sonraki
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="flex-1">
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Görsel yüklemek için Medya Kütüphanesini kullanın
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    // Navigate to media library
                    window.location.href = '/media'
                  }}
                >
                  Medya Kütüphanesine Git
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedMedia.size === 0}
          >
            {selectedMedia.size > 0
              ? `${selectedMedia.size} Görsel Seç`
              : 'Görsel Seç'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MediaPickerDialog

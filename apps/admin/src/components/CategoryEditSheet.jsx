import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { backendUrl } from "@/lib/api"
import { X, Upload, Save, Loader2, Image as ImageIcon } from "lucide-react"

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('data:')) return imageUrl // base64
  return `${backendUrl}${imageUrl}`
}

export default function CategoryEditSheet({ open, onOpenChange, category, onSuccess }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    active: true,
    order: 0,
  })

  // Image states
  const [existingImage, setExistingImage] = useState(null)
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState(null)

  // Load category data when sheet opens
  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
        keywords: category.keywords || "",
        active: category.active !== undefined ? category.active : true,
        order: category.order || 0,
      })
      setExistingImage(category.image || null)
      setNewImageFile(null)
      setNewImagePreview(null)
    }
  }, [category, open])

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        active: true,
        order: 0,
      })
      setExistingImage(null)
      setNewImageFile(null)
      setNewImagePreview(null)
      setLoading(false)
    }
  }, [open])

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove new image
  const handleRemoveNewImage = () => {
    setNewImageFile(null)
    setNewImagePreview(null)
  }

  // Remove existing image
  const handleRemoveExistingImage = () => {
    setExistingImage(null)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "Kategori adı zorunludur",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const submitFormData = new FormData()

      // Add category ID
      submitFormData.append('id', category._id)

      // Add text fields
      submitFormData.append('name', formData.name)
      submitFormData.append('description', formData.description)
      submitFormData.append('metaTitle', formData.metaTitle)
      submitFormData.append('metaDescription', formData.metaDescription)
      submitFormData.append('keywords', formData.keywords)
      submitFormData.append('active', formData.active)
      submitFormData.append('order', formData.order)

      // Add new image if selected
      if (newImageFile) {
        submitFormData.append('image', newImageFile)
      }

      // If existing image was removed and no new image, send empty image
      if (!existingImage && !newImageFile) {
        submitFormData.append('removeImage', 'true')
      }

      // Get admin token
      const token = localStorage.getItem('token')

      const response = await fetch(`${backendUrl}/api/category/update`, {
        method: 'POST',
        headers: {
          'token': token || '',
        },
        body: submitFormData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kategori güncellendi",
        })
        onSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(data.message || 'Kategori güncellenemedi')
      }
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error)
      toast({
        title: "Hata",
        description: error.message || "Kategori güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle>Kategori Düzenle</SheetTitle>
                <SheetDescription>
                  Kategori bilgilerini düzenleyin ve kaydedin
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 inline-flex lg:hidden"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Kapat</span>
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Kategori Adı <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Tulumbalar"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori açıklaması..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order">Sıralama</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Kategori Görseli</Label>
              </div>

              {/* Existing Image */}
              {existingImage && !newImagePreview && (
                <div className="relative border rounded-lg p-2">
                  <img
                    src={getImageUrl(existingImage)}
                    alt="Mevcut görsel"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3"
                    onClick={handleRemoveExistingImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* New Image Preview */}
              {newImagePreview && (
                <div className="relative border rounded-lg p-2">
                  <img
                    src={newImagePreview}
                    alt="Yeni görsel"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3"
                    onClick={handleRemoveNewImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Upload Button */}
              {!newImagePreview && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="category-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="category-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="p-3 bg-muted rounded-full">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Görsel Yükle</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG (max. 2MB)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* SEO Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">SEO Bilgileri</h3>

              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO başlığı..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO açıklaması..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="keywords">Anahtar Kelimeler</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="tulumba, tatlı, taze..."
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

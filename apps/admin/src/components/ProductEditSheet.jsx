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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { productAPI, backendUrl } from "@/lib/api"
import useCategories from "@/hooks/useCategories"
import { X, Upload, Save, Loader2 } from "lucide-react"

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('data:')) return imageUrl // base64
  return `${backendUrl}${imageUrl}`
}

export default function ProductEditSheet({ open, onOpenChange, product, onSuccess }) {
  const { toast } = useToast()
  const { categories } = useCategories()
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState({})
  const [manualSKU, setManualSKU] = useState(false) // SKU manuel mi?
  const [originalSKU, setOriginalSKU] = useState("") // Orijinal SKU (değiştirilmemesi için)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    category: "",
    subCategory: "",
    stock: 0,
    bestseller: false,
    freshType: "taze",
    packaging: "standart",
    giftWrap: false,
    labels: [],
    allergens: "",
    ingredients: "",
    shelfLife: "",
    storageInfo: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    sku: "",
    barcode: "",
  })

  // Separate state for existing vs new images (prevents flickering)
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState({})
  const [newImagePreviews, setNewImagePreviews] = useState({})

  // Load product data when sheet opens
  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        basePrice: product.basePrice || 0,
        category: product.category?._id || product.category || "",
        subCategory: product.subCategory || "",
        stock: product.stock || 0,
        bestseller: product.bestseller || false,
        freshType: product.freshType || "taze",
        packaging: product.packaging || "standart",
        giftWrap: product.giftWrap || false,
        labels: product.labels || [],
        allergens: product.allergens || "",
        ingredients: product.ingredients || "",
        shelfLife: product.shelfLife || "",
        storageInfo: product.storageInfo || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        keywords: Array.isArray(product.keywords) ? product.keywords.join(", ") : "",
        sku: product.sku || "",
        barcode: product.barcode || "",
      })

      // Store existing images separately
      setExistingImages(product.image || [])
      setNewImageFiles({})
      setNewImagePreviews({})
      setImageLoading({})

      // Store original SKU
      setOriginalSKU(product.sku || "")
      setManualSKU(false)
    }
  }, [product, open])

  const handleImageChange = (e, imageKey, index) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Dosya çok büyük",
        description: "Maksimum 5MB boyutunda görsel yükleyebilirsiniz",
      })
      return
    }

    setImageLoading(prev => ({ ...prev, [imageKey]: true }))
    setNewImageFiles(prev => ({ ...prev, [imageKey]: file }))

    const reader = new FileReader()
    reader.onloadend = () => {
      setNewImagePreviews(prev => ({ ...prev, [imageKey]: reader.result }))
      setImageLoading(prev => ({ ...prev, [imageKey]: false }))
    }
    reader.onerror = () => {
      setImageLoading(prev => ({ ...prev, [imageKey]: false }))
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Görsel yüklenirken hata oluştu",
      })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (imageKey, index) => {
    setNewImageFiles(prev => ({ ...prev, [imageKey]: null }))
    setNewImagePreviews(prev => ({ ...prev, [imageKey]: null }))

    // If removing existing image, mark as removed
    if (existingImages[index]) {
      setExistingImages(prev => {
        const updated = [...prev]
        updated[index] = null
        return updated
      })
    }
  }

  const getPreviewUrl = (imageKey, index) => {
    // Priority: new preview > existing image
    if (newImagePreviews[imageKey]) {
      return newImagePreviews[imageKey] // base64, no prefix needed
    }
    if (existingImages[index]) {
      return getImageUrl(existingImages[index]) // backend URL with prefix
    }
    return null
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun",
      })
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()

      // Product ID
      submitData.append("id", product._id)

      // Basic fields
      submitData.append("name", formData.name)
      submitData.append("description", formData.description)
      submitData.append("basePrice", formData.basePrice)
      submitData.append("category", formData.category)
      submitData.append("subCategory", formData.subCategory)
      submitData.append("stock", formData.stock)
      submitData.append("bestseller", formData.bestseller)
      submitData.append("freshType", formData.freshType)
      submitData.append("packaging", formData.packaging)
      submitData.append("giftWrap", formData.giftWrap)

      // Arrays
      submitData.append("labels", JSON.stringify(formData.labels))

      // Additional info
      submitData.append("allergens", formData.allergens)
      submitData.append("ingredients", formData.ingredients)
      submitData.append("shelfLife", formData.shelfLife)
      submitData.append("storageInfo", formData.storageInfo)

      // SEO Fields
      submitData.append("metaTitle", formData.metaTitle)
      submitData.append("metaDescription", formData.metaDescription)
      submitData.append("keywords", formData.keywords)

      // Product Identification
      if (formData.barcode) submitData.append("barcode", formData.barcode)

      // Images (only if new images selected)
      if (newImageFiles.image1) submitData.append("image1", newImageFiles.image1)
      if (newImageFiles.image2) submitData.append("image2", newImageFiles.image2)
      if (newImageFiles.image3) submitData.append("image3", newImageFiles.image3)
      if (newImageFiles.image4) submitData.append("image4", newImageFiles.image4)

      const response = await productAPI.update(submitData)

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Ürün güncellendi",
        })
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Ürün güncellenirken hata oluştu",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-xl">Ürün Düzenle</SheetTitle>
                <SheetDescription>
                  Ürün bilgilerini düzenleyin (Gramaj fiyatları ve SEO dahil)
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
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Images Section - Priority Position */}
          <div className="grid gap-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Ürün Görselleri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {["image1", "image2", "image3", "image4"].map((imageKey, index) => {
                const previewUrl = getPreviewUrl(imageKey, index)
                const isLoading = imageLoading[imageKey]

                return (
                  <div key={imageKey} className="space-y-2">
                    <Label htmlFor={imageKey} className="text-sm text-muted-foreground">
                      Görsel {index + 1}
                    </Label>
                    {previewUrl ? (
                      <div className="relative group">
                        {isLoading ? (
                          <Skeleton className="w-full h-40 rounded-lg" />
                        ) : (
                          <img
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border transition-opacity duration-200"
                            style={{ opacity: 1 }}
                            onLoad={(e) => {
                              e.target.style.opacity = 1
                            }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/placeholder-product.png'
                            }}
                          />
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(imageKey, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor={imageKey}
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        {isLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Görsel Yükle</span>
                            <span className="text-xs text-muted-foreground mt-1">(Max 5MB)</span>
                          </>
                        )}
                      </label>
                    )}
                    <Input
                      id={imageKey}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, imageKey, index)}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 border-t pt-4">
            <h3 className="font-semibold">Temel Bilgiler</h3>

            <div className="grid gap-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* SKU Manuel/Otomatik Toggle */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
              <Switch
                id="manual-sku-edit"
                checked={manualSKU}
                onCheckedChange={setManualSKU}
              />
              <Label htmlFor="manual-sku-edit" className="cursor-pointer">
                SKU'yu değiştir
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU {!manualSKU && "(Mevcut)"}</Label>
                {manualSKU ? (
                  <>
                    <Input
                      id="sku"
                      className="font-mono text-sm"
                      placeholder="Örn: TUL-500-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Yeni bir SKU kodu girin (örn: TUL-500-001)
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      id="sku"
                      value={formData.sku}
                      disabled
                      className="bg-muted font-mono text-sm"
                      placeholder="Otomatik oluşturulmuş"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mevcut SKU: {originalSKU || "Otomatik oluşturulacak"}
                    </p>
                  </>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="barcode">Barkod (Opsiyonel)</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="GTIN/EAN barkod"
                />
                <p className="text-xs text-muted-foreground">
                  Ürün barkodu (varsa)
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="grid gap-4 border-t pt-4">
            <h3 className="font-semibold">Özellikler</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tazelik Türü</Label>
                <Select
                  value={formData.freshType}
                  onValueChange={(value) => setFormData({ ...formData, freshType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taze">Taze</SelectItem>
                    <SelectItem value="kuru">Kuru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Paketleme</Label>
                <Select
                  value={formData.packaging}
                  onValueChange={(value) => setFormData({ ...formData, packaging: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standart">Standart</SelectItem>
                    <SelectItem value="özel">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bestseller"
                  checked={formData.bestseller}
                  onCheckedChange={(checked) => setFormData({ ...formData, bestseller: checked })}
                />
                <Label htmlFor="bestseller" className="cursor-pointer">
                  Çok Satan Ürün
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="giftWrap"
                  checked={formData.giftWrap}
                  onCheckedChange={(checked) => setFormData({ ...formData, giftWrap: checked })}
                />
                <Label htmlFor="giftWrap" className="cursor-pointer">
                  Hediye Paketi
                </Label>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid gap-4 border-t pt-4">
            <h3 className="font-semibold">Ek Bilgiler</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="allergens">Alerjen Bilgileri</Label>
                <Input
                  id="allergens"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ingredients">Malzemeler</Label>
                <Input
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="shelfLife">Raf Ömrü</Label>
                <Input
                  id="shelfLife"
                  value={formData.shelfLife}
                  onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="storageInfo">Saklama Koşulları</Label>
                <Input
                  id="storageInfo"
                  value={formData.storageInfo}
                  onChange={(e) => setFormData({ ...formData, storageInfo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="grid gap-4 border-t pt-4">
            <h3 className="font-semibold">SEO Ayarları</h3>

            <div className="grid gap-2">
              <Label htmlFor="metaTitle">Meta Title (max 60 karakter)</Label>
              <Input
                id="metaTitle"
                maxLength={60}
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Otomatik oluşturulacak (boş bırakılırsa)"
              />
              <p className="text-xs text-muted-foreground">
                {formData.metaTitle.length}/60 karakter
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="metaDescription">Meta Description (max 160 karakter)</Label>
              <Textarea
                id="metaDescription"
                maxLength={160}
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Otomatik oluşturulacak (boş bırakılırsa)"
              />
              <p className="text-xs text-muted-foreground">
                {formData.metaDescription.length}/160 karakter
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="keywords">Keywords (virgülle ayırın)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="tulumba, tatlı, kaymaklı, özel"
              />
            </div>
          </div>

          {/* Bottom padding for sticky footer */}
          <div className="h-4" />
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
          <SheetFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
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
        </div>
      </SheetContent>
    </Sheet>
  )
}

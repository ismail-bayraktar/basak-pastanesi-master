import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import { productAPI, backendUrl } from "@/lib/api"
import useCategories from "@/hooks/useCategories"
import { X, Upload, ImageIcon } from "lucide-react"
import { MediaPicker } from "@/components/MediaPicker"

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  return `${backendUrl}${imageUrl}`
}

export default function ProductFullEditDialog({ open, onOpenChange, product, onSuccess }) {
  const { toast } = useToast()
  const { categories } = useCategories()
  const [loading, setLoading] = useState(false)
  const [manualSKU, setManualSKU] = useState(false) // SKU manuel mi?
  const [originalSKU, setOriginalSKU] = useState("") // Orijinal SKU

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
    // SEO Fields
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    // Product Identification
    sku: "",
    barcode: "",
  })

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  })

  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  })

  // Media picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [activeImageSlot, setActiveImageSlot] = useState(null)
  const [mediaUrls, setMediaUrls] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  })

  // Load product data when dialog opens
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

      // Set image previews from existing product images
      if (product.image && Array.isArray(product.image)) {
        setImagePreviews({
          image1: product.image[0] || null,
          image2: product.image[1] || null,
          image3: product.image[2] || null,
          image4: product.image[3] || null,
        })
      }

      // Store original SKU
      setOriginalSKU(product.sku || "")
      setManualSKU(false)

      // Reset media URLs
      setMediaUrls({
        image1: null,
        image2: null,
        image3: null,
        image4: null,
      })
    }
  }, [product, open])

  // Open media picker for specific slot
  const openMediaPicker = (imageKey) => {
    setActiveImageSlot(imageKey)
    setMediaPickerOpen(true)
  }

  // Handle media selection from picker
  const handleMediaSelect = (media) => {
    if (activeImageSlot && media) {
      // Store the Cloudinary URL
      setMediaUrls(prev => ({ ...prev, [activeImageSlot]: media.url }))
      // Update preview
      setImagePreviews(prev => ({ ...prev, [activeImageSlot]: media.url }))
      // Clear file input (we're using URL now)
      setImages(prev => ({ ...prev, [activeImageSlot]: null }))
    }
    setMediaPickerOpen(false)
    setActiveImageSlot(null)
  }

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0]
    if (file) {
      setImages((prev) => ({ ...prev, [imageKey]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => ({ ...prev, [imageKey]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (imageKey) => {
    setImages((prev) => ({ ...prev, [imageKey]: null }))
    setImagePreviews((prev) => ({ ...prev, [imageKey]: null }))
    setMediaUrls((prev) => ({ ...prev, [imageKey]: null }))
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

      // Images - send either file or URL
      // File uploads (if user uploaded from disk)
      if (images.image1) submitData.append("image1", images.image1)
      if (images.image2) submitData.append("image2", images.image2)
      if (images.image3) submitData.append("image3", images.image3)
      if (images.image4) submitData.append("image4", images.image4)

      // Media Library URLs (if selected from Cloudinary)
      if (mediaUrls.image1) submitData.append("imageUrl1", mediaUrls.image1)
      if (mediaUrls.image2) submitData.append("imageUrl2", mediaUrls.image2)
      if (mediaUrls.image3) submitData.append("imageUrl3", mediaUrls.image3)
      if (mediaUrls.image4) submitData.append("imageUrl4", mediaUrls.image4)

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ürün Düzenle</DialogTitle>
          <DialogDescription>
            Ürünün tüm bilgilerini düzenleyin (SEO dahil)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="grid gap-4">
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

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="basePrice">Fiyat (₺) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                />
              </div>

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
            </div>

            {/* Product Identification */}
            {/* SKU Manuel/Otomatik Toggle */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
              <Switch
                id="manual-sku-full-edit"
                checked={manualSKU}
                onCheckedChange={setManualSKU}
              />
              <Label htmlFor="manual-sku-full-edit" className="cursor-pointer">
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
          <div className="grid gap-4">
            <h3 className="font-semibold">Seçenekler</h3>

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
              <Label htmlFor="keywords">Keywords (virgülle ayırın, max 10)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="tulumba, tatlı, kaymaklı, özel"
              />
              <p className="text-xs text-muted-foreground">
                Otomatik oluşturulacak (boş bırakılırsa)
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="grid gap-4 border-t pt-4">
            <h3 className="font-semibold">Görseller</h3>
            <div className="grid grid-cols-4 gap-4">
              {["image1", "image2", "image3", "image4"].map((imageKey, index) => (
                <div key={imageKey} className="space-y-2">
                  <Label htmlFor={imageKey}>Görsel {index + 1}</Label>
                  {imagePreviews[imageKey] ? (
                    <div className="relative">
                      <img
                        src={getImageUrl(imagePreviews[imageKey])}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/placeholder-product.png'
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(imageKey)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => openMediaPicker(imageKey)}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Kütüphaneden Seç</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media Picker Dialog */}
          <MediaPicker
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            onSelect={handleMediaSelect}
            category="products"
            title="Ürün Görseli Seç"
            description="Kütüphaneden görsel seçin"
          />

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

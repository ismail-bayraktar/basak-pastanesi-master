import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { productAPI } from "@/lib/api"
import { Upload, X, Plus, Package } from "lucide-react"
import useCategories from "@/hooks/useCategories"

export default function ProductAdd() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([null, null, null, null])

  // Fetch active categories from backend
  const { categories, loading: categoriesLoading, fetchActiveCategories } = useCategories()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    category: "",
    subCategory: "",
    sizes: [],
    weights: [],
    freshType: "taze",
    packaging: "standart",
    giftWrap: false,
    labels: [],
    personCounts: [],
    bestseller: false,
    stock: "",
    allergens: "",
    ingredients: "",
    shelfLife: "",
    storageInfo: "",
    sizePrices: [],
    barcode: "",
    sku: "", // Manuel SKU
  })

  const [manualSKU, setManualSKU] = useState(false) // SKU manuel mi?

  // Fetch active categories on component mount
  useEffect(() => {
    fetchActiveCategories()
  }, [fetchActiveCategories])

  const sizeOptions = [250, 500, 1000, 2000]
  const personCountOptions = ["2-3", "5-6", "8-10", "12+"]
  const labelOptions = ["Yeni", "İndirimde", "Öne Çıkan", "Sınırlı Üretim"]

  const handleImageUpload = (index, file) => {
    if (file) {
      const newImages = [...images]
      newImages[index] = file
      setImages(newImages)
    }
  }

  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleSizePriceChange = (size, price) => {
    setFormData((prev) => {
      const sizePrices = prev.sizePrices.filter((sp) => sp.size !== size)
      if (price) {
        sizePrices.push({ size: Number(size), price: Number(price) })
      }
      return { ...prev, sizePrices }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.description || !formData.basePrice) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen gerekli alanları doldurun",
      })
      return
    }

    if (!images.some((img) => img)) {
      toast({
        variant: "destructive",
        title: "Görsel Gerekli",
        description: "En az bir ürün görseli yüklemelisiniz",
      })
      return
    }

    if (formData.sizes.length === 0) {
      toast({
        variant: "destructive",
        title: "Gramaj Seçin",
        description: "En az bir gramaj seçmelisiniz",
      })
      return
    }

    if (formData.personCounts.length === 0) {
      toast({
        variant: "destructive",
        title: "Kişi Sayısı Seçin",
        description: "En az bir kişi sayısı seçmelisiniz",
      })
      return
    }

    setLoading(true)

    try {
      // Create FormData
      const data = new FormData()

      // Add images
      images.forEach((image, index) => {
        if (image) {
          data.append(`image${index + 1}`, image)
        }
      })

      // Add other fields
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]))
        } else {
          data.append(key, formData[key])
        }
      })

      data.append("date", Date.now())

      const response = await productAPI.add(data)

      if (response.data.success) {
        toast({
          title: "Başarılı!",
          description: "Ürün başarıyla eklendi",
        })

        // Reset form
        setFormData({
          name: "",
          description: "",
          basePrice: "",
          category: "",
          subCategory: "",
          sizes: [],
          weights: [],
          freshType: "taze",
          packaging: "standart",
          giftWrap: false,
          labels: [],
          personCounts: [],
          bestseller: false,
          stock: "",
          allergens: "",
          ingredients: "",
          shelfLife: "",
          storageInfo: "",
          sizePrices: [],
          barcode: "",
          sku: "",
        })
        setImages([null, null, null, null])
        setManualSKU(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Ürün eklenirken hata oluştu",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Ana Sayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Ürün Ekle</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8" />
              Yeni Ürün Ekle
            </h1>
            <p className="text-muted-foreground mt-1">
              Tulumbak ürün kataloğuna yeni ürün ekleyin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>Ürünün temel özelliklerini girin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ürün Adı *</Label>
                    <Input
                      id="name"
                      placeholder="Örn: Premium Antep Fıstığı"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder={categoriesLoading ? "Kategoriler yükleniyor..." : "Kategori seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                        {categories.length === 0 && !categoriesLoading && (
                          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            Kategori bulunamadı. Önce kategori ekleyin.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Ürün Açıklaması *</Label>
                  <Textarea
                    id="description"
                    placeholder="Ürün hakkında detaylı açıklama yazın..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Temel Fiyat (₺) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok Miktarı</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCategory">Alt Kategori</Label>
                    <Input
                      id="subCategory"
                      placeholder="Opsiyonel"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Identification */}
            <Card>
              <CardHeader>
                <CardTitle>Ürün Tanımlama</CardTitle>
                <CardDescription>SKU otomatik oluşturulur veya manuel girebilirsiniz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SKU Manuel/Otomatik Toggle */}
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
                  <Switch
                    id="manual-sku"
                    checked={manualSKU}
                    onCheckedChange={setManualSKU}
                  />
                  <Label htmlFor="manual-sku" className="cursor-pointer">
                    SKU'yu manuel gir
                  </Label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU {!manualSKU && "(Otomatik)"}</Label>
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
                          Benzersiz bir SKU kodu girin (örn: TUL-500-001)
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center h-10 px-3 rounded-md border border-input bg-muted text-sm font-mono text-muted-foreground">
                          Otomatik oluşturulacak
                        </div>
                        <p className="text-xs text-muted-foreground">
                          SKU kategori ve gramaj bazlı otomatik oluşturulur (örn: TUL-500-001)
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barkod (Opsiyonel)</Label>
                    <Input
                      id="barcode"
                      className="font-mono text-sm"
                      placeholder="GTIN/EAN barkod"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ürün barkodu varsa girebilirsiniz
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Ürün Görselleri</CardTitle>
                <CardDescription>En az 1, en fazla 4 görsel yükleyin (JPG, PNG)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      {image ? (
                        <div className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Görsel {index + 1}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Size & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Gramaj ve Fiyatlandırma</CardTitle>
                <CardDescription>Ürün gramajlarını seçin ve özel fiyatlar belirleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Gramaj Seçenekleri *</Label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <Badge
                        key={size}
                        variant={formData.sizes.includes(size) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayValue("sizes", size)}
                      >
                        {size}g
                      </Badge>
                    ))}
                  </div>
                </div>

                {formData.sizes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Gramaj Bazında Özel Fiyat (opsiyonel)</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {formData.sizes.map((size) => (
                        <div key={size} className="flex items-center gap-2">
                          <span className="text-sm w-16">{size}g:</span>
                          <Input
                            type="number"
                            placeholder={`Fiyat (varsayılan: ₺${formData.basePrice})`}
                            step="0.01"
                            onChange={(e) => handleSizePriceChange(size, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Person Count & Type */}
            <Card>
              <CardHeader>
                <CardTitle>Porsiyon ve Tip</CardTitle>
                <CardDescription>Kişi sayısı ve ürün tipini belirleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kişi Sayısı *</Label>
                  <div className="flex flex-wrap gap-2">
                    {personCountOptions.map((count) => (
                      <Badge
                        key={count}
                        variant={formData.personCounts.includes(count) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayValue("personCounts", count)}
                      >
                        {count} kişi
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ürün Tipi</Label>
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
                  <div className="space-y-2">
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
              </CardContent>
            </Card>

            {/* Labels & Options */}
            <Card>
              <CardHeader>
                <CardTitle>Etiketler ve Özellikler</CardTitle>
                <CardDescription>Ürün etiketleri ve özel özellikleri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Etiketler</Label>
                  <div className="flex flex-wrap gap-2">
                    {labelOptions.map((label) => (
                      <Badge
                        key={label}
                        variant={formData.labels.includes(label) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayValue("labels", label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <Label htmlFor="bestseller">Çok Satan Ürün</Label>
                    <p className="text-sm text-muted-foreground">Ürünü öne çıkan olarak işaretle</p>
                  </div>
                  <Switch
                    id="bestseller"
                    checked={formData.bestseller}
                    onCheckedChange={(checked) => setFormData({ ...formData, bestseller: checked })}
                  />
                </div>

                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <Label htmlFor="giftWrap">Hediye Paketi</Label>
                    <p className="text-sm text-muted-foreground">Hediye paketi seçeneği sunulsun</p>
                  </div>
                  <Switch
                    id="giftWrap"
                    checked={formData.giftWrap}
                    onCheckedChange={(checked) => setFormData({ ...formData, giftWrap: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ek Bilgiler</CardTitle>
                <CardDescription>Alerjen, malzeme ve saklama bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Malzemeler</Label>
                  <Textarea
                    id="ingredients"
                    placeholder="Ürünün içerdiği malzemeleri listeleyin..."
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergens">Alerjen Uyarısı</Label>
                  <Input
                    id="allergens"
                    placeholder="Örn: Fındık, süt ürünleri içerebilir"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shelfLife">Raf Ömrü</Label>
                    <Input
                      id="shelfLife"
                      placeholder="Örn: 6 ay"
                      value={formData.shelfLife}
                      onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storageInfo">Saklama Koşulları</Label>
                    <Input
                      id="storageInfo"
                      placeholder="Örn: Serin ve kuru yerde"
                      value={formData.storageInfo}
                      onChange={(e) => setFormData({ ...formData, storageInfo: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Ekleniyor..." : "Ürünü Ekle"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

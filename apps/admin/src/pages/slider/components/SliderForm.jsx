import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { sliderAPI } from "@/lib/api"
import { CalendarIcon, Upload, X, Image as ImageIcon, Smartphone, Layers, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaPicker } from "@/components/MediaPicker"

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

const templates = [
  { id: "split-left", name: "Sola Hizalı", icon: ImageIcon, description: "İçerik solda, görsel sağda" },
  { id: "split-right", name: "Sağa Hizalı", icon: ImageIcon, description: "Görsel solda, içerik sağda" },
  { id: "centered", name: "Ortalanmış", icon: Layers, description: "Merkezi konumlandırma" },
  { id: "overlay", name: "Overlay", icon: Smartphone, description: "Görsel üzerinde yazı" },
  { id: "full-width", name: "Tam Genişlik", icon: Layers, description: "Tam genişlik arkaplan" },
  { id: "v2-premium", name: "V2 Premium", icon: Sparkles, description: "Yeni Premium Tasarım" },
]

const buttonStyles = [
  { id: "primary", name: "Ana Buton" },
  { id: "secondary", name: "İkincil" },
  { id: "outline", name: "Outline" },
]

const textColors = [
  { id: "auto", name: "Otomatik" },
  { id: "light", name: "Açık" },
  { id: "dark", name: "Koyu" },
]

export function SliderForm({ slider, onSuccess, onCancel }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    template: "split-left",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "/collection",
    buttonStyle: "primary",
    overlayOpacity: 0,
    textColor: "auto",
    altText: "",
    seoTitle: "",
    order: 0,
    startDate: null,
    endDate: null,
    isActive: true,
  })

  const [images, setImages] = useState({
    image: null,
    mobileImage: null,
    backgroundImage: null,
  })

  const [imagePreviews, setImagePreviews] = useState({
    image: null,
    mobileImage: null,
    backgroundImage: null,
  })

  // Media picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [activeImageField, setActiveImageField] = useState(null)
  const [mediaUrls, setMediaUrls] = useState({
    image: null,
    mobileImage: null,
    backgroundImage: null,
  })

  useEffect(() => {
    if (slider) {
      setFormData({
        template: slider.template || "split-left",
        title: slider.title || "",
        subtitle: slider.subtitle || "",
        description: slider.description || "",
        buttonText: slider.buttonText || "",
        buttonLink: slider.buttonLink || "/collection",
        buttonStyle: slider.buttonStyle || "primary",
        overlayOpacity: slider.overlayOpacity || 0,
        textColor: slider.textColor || "auto",
        altText: slider.altText || "",
        seoTitle: slider.seoTitle || "",
        order: slider.order || 0,
        startDate: slider.startDate ? new Date(slider.startDate) : null,
        endDate: slider.endDate ? new Date(slider.endDate) : null,
        isActive: slider.isActive !== undefined ? slider.isActive : true,
      })

      // Set existing image previews with backend URL
      setImagePreviews({
        image: slider.image ? (slider.image.startsWith('http') ? slider.image : `${backendUrl}${slider.image}`) : null,
        mobileImage: slider.mobileImage ? (slider.mobileImage.startsWith('http') ? slider.mobileImage : `${backendUrl}${slider.mobileImage}`) : null,
        backgroundImage: slider.backgroundImage ? (slider.backgroundImage.startsWith('http') ? slider.backgroundImage : `${backendUrl}${slider.backgroundImage}`) : null,
      })
    }
  }, [slider])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (field, file) => {
    if (file) {
      setImages((prev) => ({ ...prev, [field]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => ({ ...prev, [field]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (field) => {
    setImages((prev) => ({ ...prev, [field]: null }))
    setImagePreviews((prev) => ({ ...prev, [field]: null }))
    setMediaUrls((prev) => ({ ...prev, [field]: null }))
  }

  // Open media picker for specific field
  const openMediaPicker = (field) => {
    setActiveImageField(field)
    setMediaPickerOpen(true)
  }

  // Handle media selection from picker
  const handleMediaSelect = (media) => {
    if (activeImageField && media) {
      // Store the Cloudinary URL
      setMediaUrls(prev => ({ ...prev, [activeImageField]: media.url }))
      // Update preview
      setImagePreviews(prev => ({ ...prev, [activeImageField]: media.url }))
      // Clear file input (we're using URL now)
      setImages(prev => ({ ...prev, [activeImageField]: null }))
    }
    setMediaPickerOpen(false)
    setActiveImageField(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title || !formData.subtitle || !formData.description || !formData.buttonText) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun",
      })
      return
    }

    if (!images.image && !slider) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir ana görsel seçin",
      })
      return
    }

    setLoading(true)
    try {
      const formDataObj = new FormData()

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "startDate" || key === "endDate") {
          if (formData[key]) {
            formDataObj.append(key, formData[key].toISOString())
          }
        } else {
          formDataObj.append(key, formData[key])
        }
      })

      // Add images (file uploads)
      if (images.image) formDataObj.append("image", images.image)
      if (images.mobileImage) formDataObj.append("mobileImage", images.mobileImage)
      if (images.backgroundImage) formDataObj.append("backgroundImage", images.backgroundImage)

      // Add media library URLs
      if (mediaUrls.image) formDataObj.append("imageUrl", mediaUrls.image)
      if (mediaUrls.mobileImage) formDataObj.append("mobileImageUrl", mediaUrls.mobileImage)
      if (mediaUrls.backgroundImage) formDataObj.append("backgroundImageUrl", mediaUrls.backgroundImage)

      let response
      if (slider?._id) {
        response = await sliderAPI.update(slider._id, formDataObj)
      } else {
        response = await sliderAPI.add(formDataObj)
      }

      if (response.data.success) {
        toast({
          title: "Başarılı!",
          description: slider ? "Slider güncellendi" : "Slider oluşturuldu",
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "İşlem başarısız",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Şablon Seçimi</CardTitle>
          <CardDescription>Slider'ınızın görünümünü seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {templates.map((template) => {
              const Icon = template.icon
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleInputChange("template", template.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:border-primary",
                    formData.template === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-xs font-medium text-center">{template.name}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {template.description}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Fields */}
      <Card>
        <CardHeader>
          <CardTitle>İçerik</CardTitle>
          <CardDescription>Slider metinlerini girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ana başlık"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Alt Başlık *</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Alt başlık"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detaylı açıklama"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Buton Metni *</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => handleInputChange("buttonText", e.target.value)}
                placeholder="Şimdi Keşfet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonLink">Buton Linki</Label>
              <Input
                id="buttonLink"
                value={formData.buttonLink}
                onChange={(e) => handleInputChange("buttonLink", e.target.value)}
                placeholder="/collection"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Görseller</CardTitle>
          <CardDescription>Slider görsellerini yükleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Image */}
          <div className="space-y-2">
            <Label>Ana Görsel * {!slider && "(Zorunlu)"}</Label>
            {imagePreviews.image ? (
              <div className="relative">
                <img
                  src={imagePreviews.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveImage("image")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => openMediaPicker("image")}
              >
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Kütüphaneden seçin</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Image */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobil Görsel (Opsiyonel)
            </Label>
            {imagePreviews.mobileImage ? (
              <div className="relative">
                <img
                  src={imagePreviews.mobileImage}
                  alt="Mobile Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveImage("mobileImage")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => openMediaPicker("mobileImage")}
              >
                <div className="flex flex-col items-center">
                  <Smartphone className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Kütüphaneden seçin</p>
                </div>
              </div>
            )}
          </div>

          {/* Background Image (for overlay/full-width templates) */}
          {(formData.template === "overlay" || formData.template === "full-width") && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Arka Plan Görseli (Opsiyonel)
              </Label>
              {imagePreviews.backgroundImage ? (
                <div className="relative">
                  <img
                    src={imagePreviews.backgroundImage}
                    alt="Background Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveImage("backgroundImage")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                  onClick={() => openMediaPicker("backgroundImage")}
                >
                  <div className="flex flex-col items-center">
                    <Layers className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Kütüphaneden seçin</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Picker Dialog */}
      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
        category="sliders"
        title="Slider Görseli Seç"
        description="Kütüphaneden görsel seçin"
      />

      {/* Styling */}
      <Card>
        <CardHeader>
          <CardTitle>Görsel Ayarlar</CardTitle>
          <CardDescription>Renk ve stil seçenekleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonStyle">Buton Stili</Label>
              <Select
                value={formData.buttonStyle}
                onValueChange={(value) => handleInputChange("buttonStyle", value)}
              >
                <SelectTrigger id="buttonStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Yazı Rengi</Label>
              <Select
                value={formData.textColor}
                onValueChange={(value) => handleInputChange("textColor", value)}
              >
                <SelectTrigger id="textColor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {textColors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      {color.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(formData.template === "overlay" || formData.template === "full-width") && (
            <div className="space-y-2">
              <Label>Overlay Opaklığı: {formData.overlayOpacity}%</Label>
              <Slider
                value={[formData.overlayOpacity]}
                onValueChange={([value]) => handleInputChange("overlayOpacity", value)}
                max={100}
                step={5}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO & Advanced */}
      <Card>
        <CardHeader>
          <CardTitle>SEO ve Gelişmiş</CardTitle>
          <CardDescription>Arama motoru optimizasyonu ve sıralama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altText">Alt Metin (Alt Text)</Label>
              <Input
                id="altText"
                value={formData.altText}
                onChange={(e) => handleInputChange("altText", e.target.value)}
                placeholder="Görsel açıklaması"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Başlığı</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                placeholder="SEO için başlık"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Sıralama Numarası</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Zamanlama</CardTitle>
          <CardDescription>Slider'ın gösterim tarihlerini ayarlayın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Slider Aktif</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP")
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP")
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : slider ? "Güncelle" : "Oluştur"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </form>
  )
}

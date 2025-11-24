import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Palette, Image, Type, Link, Send, CheckCircle, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

/**
 * Design Tab Component for Email Template Customization
 * Clean, modular component following SRP
 */
export default function DesignTab({ settings, updateSetting, onSave }) {
  const { toast } = useToast()
  const [testingTemplate, setTestingTemplate] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [logoUploadType, setLogoUploadType] = useState("url")
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Load available templates
  const loadAvailableTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await api.get("/api/email/settings/available-templates")
      if (response.data.success) {
        setAvailableTemplates(response.data.templates)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir resim dosyası seçin (PNG, JPG, SVG)",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Dosya boyutu 2MB'dan küçük olmalıdır",
      })
      return
    }

    try {
      setUploadingLogo(true)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload to Cloudinary via backend
      const response = await api.post("/api/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        const imageUrl = response.data.fileUrl
        updateSetting("design.logoUrl", imageUrl)

        // Auto-save to database
        if (onSave) {
          await onSave()
        }

        toast({
          title: "Başarılı",
          description: "Logo başarıyla yüklendi ve kaydedildi",
        })
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Logo yüklenemedi",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  // Test React Email template
  const handleTestTemplate = async (templateType) => {
    const testEmail = prompt("Test emaili göndermek için email adresinizi girin:")
    if (!testEmail) return

    try {
      setTestingTemplate(true)
      const response = await api.post("/api/email/settings/test-template", {
        templateType,
        testEmail,
      })

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Test emaili gönderildi. Lütfen gelen kutunuzu kontrol edin.",
        })
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Test emaili gönderilemedi",
      })
    } finally {
      setTestingTemplate(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand Identity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Marka Kimliği
          </CardTitle>
          <CardDescription>
            Email tasarımında kullanılacak logo, renk ve yazı tipi ayarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload - Modern Options */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Email Logosu
            </Label>

            {/* Upload Type Selection */}
            <RadioGroup
              value={logoUploadType}
              onValueChange={setLogoUploadType}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="logo-url" />
                <Label htmlFor="logo-url" className="font-normal cursor-pointer">
                  <Link className="h-3 w-3 inline mr-1" />
                  URL Link
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="logo-upload" />
                <Label htmlFor="logo-upload" className="font-normal cursor-pointer">
                  <Upload className="h-3 w-3 inline mr-1" />
                  Dosya Yükle
                </Label>
              </div>
            </RadioGroup>

            {/* URL Input */}
            {logoUploadType === "url" && (
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://tulumbak.com/logo.png"
                  value={settings?.design?.logoUrl || ""}
                  onChange={(e) => updateSetting("design.logoUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Logo için harici URL adresi girin
                </p>
              </div>
            )}

            {/* File Upload */}
            {logoUploadType === "upload" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="flex-1"
                  />
                  {uploadingLogo && (
                    <Button disabled className="min-w-[100px]">
                      Yükleniyor...
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG veya SVG formatında logo yükleyin (max 2MB)
                </p>
              </div>
            )}

            {/* Current Logo Preview */}
            {settings?.design?.logoUrl && (
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-xs font-medium mb-2">Mevcut Logo:</p>
                <img
                  src={settings.design.logoUrl}
                  alt="Logo Preview"
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "block"
                  }}
                />
                <p
                  className="text-xs text-muted-foreground mt-2 hidden break-all"
                  style={{ display: "none" }}
                >
                  {settings.design.logoUrl}
                </p>
              </div>
            )}
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="design-color" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Marka Rengi
            </Label>
            <div className="flex gap-2">
              <Input
                id="design-color"
                type="color"
                value={settings?.design?.brandColor || "#d4af37"}
                onChange={(e) => updateSetting("design.brandColor", e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={settings?.design?.brandColor || "#d4af37"}
                onChange={(e) => updateSetting("design.brandColor", e.target.value)}
                placeholder="#d4af37"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email header ve butonlarda kullanılacak ana renk
            </p>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="design-font" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Yazı Tipi
            </Label>
            <Input
              id="design-font"
              type="text"
              placeholder='-apple-system, BlinkMacSystemFont, "Segoe UI"'
              value={settings?.design?.fontFamily || ""}
              onChange={(e) => updateSetting("design.fontFamily", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email'de kullanılacak font ailesi (CSS font-family değeri)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Store Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mağaza Bilgileri</CardTitle>
          <CardDescription>
            Email footer'ında gösterilecek iletişim bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="design-store-name">Mağaza Adı</Label>
            <Input
              id="design-store-name"
              type="text"
              placeholder="Tulumbak İzmir Baklava"
              value={settings?.design?.storeName || ""}
              onChange={(e) => updateSetting("design.storeName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="design-store-email">Email</Label>
              <Input
                id="design-store-email"
                type="email"
                placeholder="info@tulumbak.com"
                value={settings?.design?.storeEmail || ""}
                onChange={(e) => updateSetting("design.storeEmail", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="design-store-phone">Telefon</Label>
              <Input
                id="design-store-phone"
                type="tel"
                placeholder="0232 XXX XXXX"
                value={settings?.design?.storePhone || ""}
                onChange={(e) => updateSetting("design.storePhone", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KVKK Compliance Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            KVKK Uyumluluk Linkleri
          </CardTitle>
          <CardDescription>
            Email footer'ında gösterilecek yasal linkler (KVKK uyumluluğu için gerekli)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Bu linkler tüm müşteri emaillerinde otomatik olarak footer'a eklenir
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="design-privacy-url">Gizlilik Politikası URL</Label>
            <Input
              id="design-privacy-url"
              type="url"
              placeholder="https://tulumbak.com/privacy"
              value={settings?.design?.privacyPolicyUrl || ""}
              onChange={(e) => updateSetting("design.privacyPolicyUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-email-prefs-url">Email Tercihleri URL</Label>
            <Input
              id="design-email-prefs-url"
              type="url"
              placeholder="https://tulumbak.com/email-preferences"
              value={settings?.design?.emailPreferencesUrl || ""}
              onChange={(e) => updateSetting("design.emailPreferencesUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Kullanıcıların email tercihlerini yönetebildikleri sayfa
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-unsubscribe-url">Abonelikten Çıkma URL</Label>
            <Input
              id="design-unsubscribe-url"
              type="url"
              placeholder="https://tulumbak.com/unsubscribe"
              value={settings?.design?.unsubscribeUrl || ""}
              onChange={(e) => updateSetting("design.unsubscribeUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Marketing emaillerinde gösterilir (transactional'da gösterilmez)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Template Testing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Tasarım Testi
          </CardTitle>
          <CardDescription>
            Email tasarımının canlı önizlemesini kendi emailinize gönderin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Test emaili, güncel tasarım ayarlarınızla (logo, renk, font) örnek sipariş verisi kullanarak gönderilir.
              Değişiklikleri test etmeden önce mutlaka kaydedin.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={loadAvailableTemplates}
              disabled={loadingTemplates}
              variant="outline"
              className="w-full"
            >
              {loadingTemplates ? "Yükleniyor..." : "Mevcut Şablonları Göster"}
            </Button>

            {availableTemplates.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>Mevcut Email Şablonları:</Label>
                {availableTemplates.map((template) => (
                  <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{template.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-xs text-muted-foreground">
                        React Email Professional Template
                      </p>
                    </div>
                    <Button
                      onClick={() => handleTestTemplate(template)}
                      disabled={testingTemplate}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Test Gönder
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

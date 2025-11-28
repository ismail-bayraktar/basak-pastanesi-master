import { useState, useEffect } from "react"
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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Globe,
  DollarSign,
  Share2,
  CreditCard,
  Save,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { backendUrl } from "@/App"

export default function GeneralSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    maintenanceMode: false,
    notificationsEnabled: true,
    notificationSound: true,
  })

  // SEO Settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    googleAnalyticsId: "",
    googleSiteVerification: "",
    facebookPixelId: "",
  })

  // Currency Settings
  const [currencySettings, setCurrencySettings] = useState({
    currency: "TRY",
    currencySymbol: "₺",
    decimalPlaces: 2,
    taxRate: 20,
    shippingCost: 0,
    freeShippingThreshold: 0,
  })

  // Social Media Settings
  const [socialSettings, setSocialSettings] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
    whatsapp: "",
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: {
      creditCard: true,
      bankTransfer: true,
      cashOnDelivery: true,
    },
    paytrEnabled: false,
    paytrMerchantId: "",
    paytrMerchantKey: "",
    paytrMerchantSalt: "",
    paytrTestMode: "1",
    paytrOkUrl: "",
    paytrFailUrl: "",
  })

  // Fetch all settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const [generalRes, seoRes, currencyRes, socialRes, paymentRes] = await Promise.all([
        axios.get(`${backendUrl}/api/settings/category/general`, {
          headers: { token },
        }),
        axios.get(`${backendUrl}/api/settings/category/seo`, {
          headers: { token },
        }),
        axios.get(`${backendUrl}/api/settings/category/currency`, {
          headers: { token },
        }),
        axios.get(`${backendUrl}/api/settings/category/social`, {
          headers: { token },
        }),
        axios.get(`${backendUrl}/api/settings/category/payment`, {
          headers: { token },
        }),
      ])

      if (generalRes.data.success) {
        setGeneralSettings(prev => ({ ...prev, ...generalRes.data.settings }))
      }
      if (seoRes.data.success) {
        setSeoSettings(prev => ({ ...prev, ...seoRes.data.settings }))
      }
      if (currencyRes.data.success) {
        setCurrencySettings(prev => ({ ...prev, ...currencyRes.data.settings }))
      }
      if (socialRes.data.success) {
        setSocialSettings(prev => ({ ...prev, ...socialRes.data.settings }))
      }
      if (paymentRes.data.success) {
        setPaymentSettings(prev => ({ ...prev, ...paymentRes.data.settings }))
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Hata",
        description: "Ayarlar yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (category, settings) => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      // Convert settings object to array of {key, value, category}
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key: `${category}.${key}`,
        value,
        category,
      }))

      const response = await axios.post(
        `${backendUrl}/api/settings/bulk-update`,
        { settings: settingsArray },
        { headers: { token } }
      )

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Ayarlar kaydedildi",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Hata",
        description: error.response?.data?.message || "Ayarlar kaydedilemedi",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Basak Pastanesi Admin
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Genel Ayarlar</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Badge variant="outline" className="text-sm">
              Sistem Ayarları
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
              <p className="text-muted-foreground">
                Site genelinde kullanılan ayarları yönetin
              </p>
            </div>
            <Button onClick={fetchSettings} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto md:grid-cols-5">
              <TabsTrigger value="general" className="flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Genel</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                <span>SEO</span>
              </TabsTrigger>
              <TabsTrigger value="currency" className="flex items-center justify-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Para Birimi</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Sosyal Medya</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Ödeme</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Ayarlar</CardTitle>
                  <CardDescription>
                    Site genelinde kullanılan temel bilgiler
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Adı</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                        }
                        placeholder="Basak Pastanesi E-Ticaret"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">İletişim E-posta</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })
                        }
                        placeholder="info@basakpastanesi.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Açıklaması</Label>
                    <Textarea
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                      }
                      placeholder="Site açıklaması..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">İletişim Telefon</Label>
                      <Input
                        id="contactPhone"
                        value={generalSettings.contactPhone}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })
                        }
                        placeholder="+90 555 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Input
                        id="address"
                        value={generalSettings.address}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, address: e.target.value })
                        }
                        placeholder="İstanbul, Türkiye"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Bakım Modu</Label>
                      <p className="text-sm text-muted-foreground">
                        Site bakımda olduğunda müşterilere bilgi gösterilir
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="space-y-0.5">
                      <Label>Sipariş Bildirimleri</Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni sipariş geldiğinde gerçek zamanlı bildirim alın
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.notificationsEnabled}
                      onCheckedChange={(checked) => {
                        setGeneralSettings({ ...generalSettings, notificationsEnabled: checked })
                        localStorage.setItem('notificationsEnabled', checked.toString())
                      }}
                    />
                  </div>

                  {generalSettings.notificationsEnabled && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Bildirim Sesi</Label>
                        <p className="text-sm text-muted-foreground">
                          Bildirimler için sesli uyarı çal
                        </p>
                      </div>
                      <Switch
                        checked={generalSettings.notificationSound}
                        onCheckedChange={(checked) => {
                          setGeneralSettings({ ...generalSettings, notificationSound: checked })
                          localStorage.setItem('notificationSound', checked.toString())
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveSettings("general", generalSettings)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings Tab */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Ayarları</CardTitle>
                  <CardDescription>
                    Arama motoru optimizasyonu ve analytics ayarları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Başlık</Label>
                    <Input
                      id="metaTitle"
                      value={seoSettings.metaTitle}
                      onChange={(e) =>
                        setSeoSettings({ ...seoSettings, metaTitle: e.target.value })
                      }
                      placeholder="Basak Pastanesi - Online Alışveriş"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Açıklama</Label>
                    <Textarea
                      id="metaDescription"
                      value={seoSettings.metaDescription}
                      onChange={(e) =>
                        setSeoSettings({ ...seoSettings, metaDescription: e.target.value })
                      }
                      placeholder="Site meta açıklaması..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                    <Input
                      id="metaKeywords"
                      value={seoSettings.metaKeywords}
                      onChange={(e) =>
                        setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })
                      }
                      placeholder="eticaret, online alışveriş, ..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={seoSettings.googleAnalyticsId}
                        onChange={(e) =>
                          setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })
                        }
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="googleSiteVerification">Google Site Verification</Label>
                      <Input
                        id="googleSiteVerification"
                        value={seoSettings.googleSiteVerification}
                        onChange={(e) =>
                          setSeoSettings({ ...seoSettings, googleSiteVerification: e.target.value })
                        }
                        placeholder="verification-code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                    <Input
                      id="facebookPixelId"
                      value={seoSettings.facebookPixelId}
                      onChange={(e) =>
                        setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })
                      }
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveSettings("seo", seoSettings)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Currency Settings Tab */}
            <TabsContent value="currency">
              <Card>
                <CardHeader>
                  <CardTitle>Para Birimi Ayarları</CardTitle>
                  <CardDescription>
                    Fiyatlandırma ve kargo ayarları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Para Birimi</Label>
                      <Input
                        id="currency"
                        value={currencySettings.currency}
                        onChange={(e) =>
                          setCurrencySettings({ ...currencySettings, currency: e.target.value })
                        }
                        placeholder="TRY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Para Sembolü</Label>
                      <Input
                        id="currencySymbol"
                        value={currencySettings.currencySymbol}
                        onChange={(e) =>
                          setCurrencySettings({ ...currencySettings, currencySymbol: e.target.value })
                        }
                        placeholder="₺"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decimalPlaces">Ondalık Basamak</Label>
                      <Input
                        id="decimalPlaces"
                        type="number"
                        value={currencySettings.decimalPlaces}
                        onChange={(e) =>
                          setCurrencySettings({ ...currencySettings, decimalPlaces: parseInt(e.target.value) })
                        }
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">KDV Oranı (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={currencySettings.taxRate}
                        onChange={(e) =>
                          setCurrencySettings({ ...currencySettings, taxRate: parseFloat(e.target.value) })
                        }
                        placeholder="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingCost">Kargo Ücreti</Label>
                      <Input
                        id="shippingCost"
                        type="number"
                        value={currencySettings.shippingCost}
                        onChange={(e) =>
                          setCurrencySettings({ ...currencySettings, shippingCost: parseFloat(e.target.value) })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freeShippingThreshold">Ücretsiz Kargo Limiti</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        value={currencySettings.freeShippingThreshold}
                        onChange={(e) =>
                          setCurrencySettings({ ...currencySettings, freeShippingThreshold: parseFloat(e.target.value) })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveSettings("currency", currencySettings)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Media Settings Tab */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medya Ayarları</CardTitle>
                  <CardDescription>
                    Sosyal medya hesap bağlantıları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={socialSettings.facebook}
                        onChange={(e) =>
                          setSocialSettings({ ...socialSettings, facebook: e.target.value })
                        }
                        placeholder="https://facebook.com/basakpastanesi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={socialSettings.instagram}
                        onChange={(e) =>
                          setSocialSettings({ ...socialSettings, instagram: e.target.value })
                        }
                        placeholder="https://instagram.com/basakpastanesi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={socialSettings.twitter}
                        onChange={(e) =>
                          setSocialSettings({ ...socialSettings, twitter: e.target.value })
                        }
                        placeholder="https://twitter.com/basakpastanesi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={socialSettings.youtube}
                        onChange={(e) =>
                          setSocialSettings({ ...socialSettings, youtube: e.target.value })
                        }
                        placeholder="https://youtube.com/basakpastanesi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={socialSettings.linkedin}
                        onChange={(e) =>
                          setSocialSettings({ ...socialSettings, linkedin: e.target.value })
                        }
                        placeholder="https://linkedin.com/company/basakpastanesi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={socialSettings.whatsapp}
                        onChange={(e) =>
                          setSocialSettings({ ...socialSettings, whatsapp: e.target.value })
                        }
                        placeholder="+90 555 123 4567"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveSettings("social", socialSettings)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings Tab */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme Ayarları</CardTitle>
                  <CardDescription>
                    Ödeme yöntemleri ve entegrasyon ayarları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Ödeme Yöntemleri</h3>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Kredi Kartı</Label>
                        <p className="text-sm text-muted-foreground">
                          Kredi kartı ile ödeme kabul et
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.paymentMethods.creditCard}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            paymentMethods: { ...paymentSettings.paymentMethods, creditCard: checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Banka Havalesi</Label>
                        <p className="text-sm text-muted-foreground">
                          Banka havalesi ile ödeme kabul et
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.paymentMethods.bankTransfer}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            paymentMethods: { ...paymentSettings.paymentMethods, bankTransfer: checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Kapıda Ödeme</Label>
                        <p className="text-sm text-muted-foreground">
                          Kapıda nakit/kart ile ödeme kabul et
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.paymentMethods.cashOnDelivery}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            paymentMethods: { ...paymentSettings.paymentMethods, cashOnDelivery: checked }
                          })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">PayTR Entegrasyonu</h3>
                      <Switch
                        checked={paymentSettings.paytrEnabled}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, paytrEnabled: checked })
                        }
                      />
                    </div>

                    {paymentSettings.paytrEnabled && (
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>PayTR Güvenlik Bilgileri:</strong> Merchant key ve salt bilgilerinizi güvenli saklayın. Bu bilgiler ödeme işlemleriniz için kritik öneme sahiptir.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paytrMerchantId">PayTR Merchant ID *</Label>
                          <Input
                            id="paytrMerchantId"
                            value={paymentSettings.paytrMerchantId}
                            onChange={(e) =>
                              setPaymentSettings({ ...paymentSettings, paytrMerchantId: e.target.value })
                            }
                            placeholder="123456"
                          />
                          <p className="text-xs text-muted-foreground">
                            PayTR hesabınızdan alacağınız merchant ID
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paytrMerchantKey">PayTR Merchant Key *</Label>
                          <Input
                            id="paytrMerchantKey"
                            type="password"
                            value={paymentSettings.paytrMerchantKey}
                            onChange={(e) =>
                              setPaymentSettings({ ...paymentSettings, paytrMerchantKey: e.target.value })
                            }
                            placeholder="xxxxxxxxxxxxxx"
                          />
                          <p className="text-xs text-muted-foreground">
                            Merchant key bilgisi (Güvenli saklanır)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paytrMerchantSalt">PayTR Merchant Salt *</Label>
                          <Input
                            id="paytrMerchantSalt"
                            type="password"
                            value={paymentSettings.paytrMerchantSalt}
                            onChange={(e) =>
                              setPaymentSettings({ ...paymentSettings, paytrMerchantSalt: e.target.value })
                            }
                            placeholder="xxxxxxxxxxxxxx"
                          />
                          <p className="text-xs text-muted-foreground">
                            Merchant salt bilgisi (Güvenli saklanır)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <Label>Test Modu</Label>
                              <p className="text-sm text-muted-foreground">
                                Test modunda gerçek ödeme alınmaz (0: Canlı, 1: Test)
                              </p>
                            </div>
                            <Switch
                              checked={paymentSettings.paytrTestMode === '1'}
                              onCheckedChange={(checked) =>
                                setPaymentSettings({ ...paymentSettings, paytrTestMode: checked ? '1' : '0' })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="paytrOkUrl">Başarılı Ödeme URL</Label>
                            <Input
                              id="paytrOkUrl"
                              value={paymentSettings.paytrOkUrl}
                              onChange={(e) =>
                                setPaymentSettings({ ...paymentSettings, paytrOkUrl: e.target.value })
                              }
                              placeholder="https://www.siteniz.com/success"
                            />
                            <p className="text-xs text-muted-foreground">
                              Ödeme başarılı olduğunda kullanıcının yönlendirileceği sayfa
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paytrFailUrl">Başarısız Ödeme URL</Label>
                            <Input
                              id="paytrFailUrl"
                              value={paymentSettings.paytrFailUrl}
                              onChange={(e) =>
                                setPaymentSettings({ ...paymentSettings, paytrFailUrl: e.target.value })
                              }
                              placeholder="https://www.siteniz.com/failed"
                            />
                            <p className="text-xs text-muted-foreground">
                              Ödeme başarısız olduğunda kullanıcının yönlendirileceği sayfa
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Callback URL:</strong> PayTR'de ayarlayın → <code className="bg-blue-100 px-1 rounded">https://api.siteniz.com/api/paytr/callback</code>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveSettings("payment", paymentSettings)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

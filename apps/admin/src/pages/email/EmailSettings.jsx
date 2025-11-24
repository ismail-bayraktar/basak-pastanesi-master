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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  Server,
  Bell,
  Database,
  CheckCircle,
  AlertCircle,
  Send,
  Palette,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import DesignTab from "./DesignTab"

export default function EmailSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/email/settings")
      if (response.data.success) {
        setSettings(response.data.settings)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Email ayarları yüklenemedi",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await api.put("/api/email/settings", settings)
      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Email ayarları kaydedildi",
        })
        setSettings(response.data.settings)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Kaydetme başarısız",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    const testEmail = prompt("Test emaili göndermek için email adresinizi girin:")
    if (!testEmail) return

    try {
      setTesting(true)
      const response = await api.post("/api/email/settings/test", {
        host: settings.smtp.host,
        port: settings.smtp.port,
        user: settings.smtp.user,
        password: settings.smtp.password,
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
      setTesting(false)
    }
  }

  const updateSetting = (path, value) => {
    const newSettings = { ...settings }
    const keys = path.split(".")
    let current = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            Yükleniyor...
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                  <BreadcrumbPage>Email Ayarları</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Mail className="h-8 w-8" />
                Email Yönetimi
              </h1>
              <p className="text-muted-foreground mt-1">
                SMTP ayarları, email tetikleyicileri ve loglama yapılandırması
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>

          {/* Master Switch */}
          <Alert className={settings?.general?.enabled ? "border-green-500" : "border-gray-300"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings?.general?.enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-semibold">
                    Email Sistemi {settings?.general?.enabled ? "Aktif" : "Pasif"}
                  </h3>
                  <AlertDescription>
                    {settings?.general?.enabled
                      ? "Tüm email bildirimleri gönderilecektir"
                      : "Email gönderimi devre dışı"}
                  </AlertDescription>
                </div>
              </div>
              <Switch
                checked={settings?.general?.enabled || false}
                onCheckedChange={(checked) => updateSetting("general.enabled", checked)}
              />
            </div>
          </Alert>

          {/* Tabs */}
          <Tabs defaultValue="smtp" className="space-y-4">
            <TabsList>
              <TabsTrigger value="smtp">
                <Server className="h-4 w-4 mr-2" />
                SMTP Ayarları
              </TabsTrigger>
              <TabsTrigger value="design">
                <Palette className="h-4 w-4 mr-2" />
                Tasarım
              </TabsTrigger>
              <TabsTrigger value="triggers">
                <Bell className="h-4 w-4 mr-2" />
                Email Tetikleyicileri
              </TabsTrigger>
              <TabsTrigger value="logging">
                <Database className="h-4 w-4 mr-2" />
                Loglama
              </TabsTrigger>
            </TabsList>

            {/* SMTP Settings Tab */}
            <TabsContent value="smtp">
              <Card>
                <CardHeader>
                  <CardTitle>SMTP Konfigürasyonu</CardTitle>
                  <CardDescription>
                    Email göndermek için SMTP sunucu ayarlarını yapılandırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp-enabled"
                      checked={settings?.smtp?.enabled || false}
                      onCheckedChange={(checked) => updateSetting("smtp.enabled", checked)}
                    />
                    <Label htmlFor="smtp-enabled">SMTP Aktif</Label>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.gmail.com"
                        value={settings?.smtp?.host || ""}
                        onChange={(e) => updateSetting("smtp.host", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        placeholder="587"
                        value={settings?.smtp?.port || ""}
                        onChange={(e) => updateSetting("smtp.port", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Kullanıcı</Label>
                      <Input
                        id="smtp-user"
                        type="email"
                        placeholder="user@gmail.com"
                        value={settings?.smtp?.user || ""}
                        onChange={(e) => updateSetting("smtp.user", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">SMTP Şifre</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        placeholder="••••••••"
                        value={settings?.smtp?.password || ""}
                        onChange={(e) => updateSetting("smtp.password", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-name">Gönderen Adı</Label>
                      <Input
                        id="from-name"
                        placeholder="Tulumbak Baklava"
                        value={settings?.smtp?.fromName || ""}
                        onChange={(e) => updateSetting("smtp.fromName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-email">Gönderen Email</Label>
                      <Input
                        id="from-email"
                        type="email"
                        placeholder="noreply@tulumbak.com"
                        value={settings?.smtp?.fromEmail || ""}
                        onChange={(e) => updateSetting("smtp.fromEmail", e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    onClick={handleTestEmail}
                    disabled={testing || !settings?.smtp?.enabled}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {testing ? "Gönderiliyor..." : "Test Emaili Gönder"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design">
              <DesignTab settings={settings} updateSetting={updateSetting} onSave={handleSave} />
            </TabsContent>

            {/* Triggers Tab */}
            <TabsContent value="triggers">
              <Card>
                <CardHeader>
                  <CardTitle>Email Tetikleyicileri</CardTitle>
                  <CardDescription>
                    Hangi durumlarda email gönderileceğini belirleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-registration">Kullanıcı Kaydı</Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni kullanıcı kaydolduğunda
                      </p>
                    </div>
                    <Switch
                      id="trigger-registration"
                      checked={settings?.triggers?.userRegistration || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.userRegistration", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-order-created">Sipariş Oluşturuldu</Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni sipariş alındığında
                      </p>
                    </div>
                    <Switch
                      id="trigger-order-created"
                      checked={settings?.triggers?.orderCreated || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.orderCreated", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-order-status">Sipariş Durumu Güncellendi</Label>
                      <p className="text-sm text-muted-foreground">
                        Sipariş durumu değiştiğinde
                      </p>
                    </div>
                    <Switch
                      id="trigger-order-status"
                      checked={settings?.triggers?.orderStatusUpdate || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.orderStatusUpdate", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-preparing">Sipariş Hazırlanıyor</Label>
                      <p className="text-sm text-muted-foreground">
                        Sipariş hazırlanmaya başladığında
                      </p>
                    </div>
                    <Switch
                      id="trigger-preparing"
                      checked={settings?.triggers?.orderPreparing || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.orderPreparing", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-courier">Kuryeye Verildi</Label>
                      <p className="text-sm text-muted-foreground">
                        Sipariş kuryeye teslim edildiğinde
                      </p>
                    </div>
                    <Switch
                      id="trigger-courier"
                      checked={settings?.triggers?.courierAssigned || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.courierAssigned", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-delivered">Sipariş Teslim Edildi</Label>
                      <p className="text-sm text-muted-foreground">
                        Sipariş müşteriye teslim edildiğinde
                      </p>
                    </div>
                    <Switch
                      id="trigger-delivered"
                      checked={settings?.triggers?.orderDelivered || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.orderDelivered", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-payment">Ödeme Alındı</Label>
                      <p className="text-sm text-muted-foreground">
                        Ödeme başarıyla tamamlandığında
                      </p>
                    </div>
                    <Switch
                      id="trigger-payment"
                      checked={settings?.triggers?.paymentReceived || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.paymentReceived", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-payment-failed">Ödeme Başarısız</Label>
                      <p className="text-sm text-muted-foreground">
                        Ödeme başarısız olduğunda
                      </p>
                    </div>
                    <Switch
                      id="trigger-payment-failed"
                      checked={settings?.triggers?.paymentFailed || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.paymentFailed", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="trigger-low-stock">Düşük Stok Uyarısı</Label>
                      <p className="text-sm text-muted-foreground">
                        Ürün stoğu azaldığında
                      </p>
                    </div>
                    <Switch
                      id="trigger-low-stock"
                      checked={settings?.triggers?.lowStock || false}
                      onCheckedChange={(checked) =>
                        updateSetting("triggers.lowStock", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logging Tab */}
            <TabsContent value="logging">
              <Card>
                <CardHeader>
                  <CardTitle>Loglama Ayarları</CardTitle>
                  <CardDescription>
                    Email gönderim loglarını yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="logging-enabled"
                      checked={settings?.logging?.enabled || false}
                      onCheckedChange={(checked) => updateSetting("logging.enabled", checked)}
                    />
                    <Label htmlFor="logging-enabled">Loglama Aktif</Label>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Log Saklama Süresi (Gün)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      min="1"
                      max="365"
                      value={settings?.logging?.retentionDays || 30}
                      onChange={(e) =>
                        updateSetting("logging.retentionDays", parseInt(e.target.value))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Bu süreden eski loglar otomatik silinecektir
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="log-successful"
                        checked={settings?.logging?.logSuccessful || false}
                        onCheckedChange={(checked) =>
                          updateSetting("logging.logSuccessful", checked)
                        }
                      />
                      <Label htmlFor="log-successful">
                        Başarılı email gönderimlerini logla
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="log-failed"
                        checked={settings?.logging?.logFailed || false}
                        onCheckedChange={(checked) =>
                          updateSetting("logging.logFailed", checked)
                        }
                      />
                      <Label htmlFor="log-failed">
                        Başarısız email gönderimlerini logla
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email (BCC)</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@tulumbak.com"
                      value={settings?.general?.adminEmail || ""}
                      onChange={(e) => updateSetting("general.adminEmail", e.target.value)}
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="bcc-admin"
                        checked={settings?.general?.bccAdmin || false}
                        onCheckedChange={(checked) =>
                          updateSetting("general.bccAdmin", checked)
                        }
                      />
                      <Label htmlFor="bcc-admin">
                        Tüm emaillerde admin adresini BCC olarak ekle
                      </Label>
                    </div>
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

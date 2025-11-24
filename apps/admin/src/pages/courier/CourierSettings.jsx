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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { courierAPI } from "@/lib/api"
import { LogViewer } from "./components/LogViewer"
import {
  Settings,
  Truck,
  TestTube,
  Shield,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { NotificationSettingsModal } from "@/components/NotificationSettingsModal"
import { useCourierData } from "@/pages/dashboard/hooks/useCourierData"
import { useRealtimeStats } from "@/pages/dashboard/hooks/useRealtimeStats"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"

export default function CourierSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testingOrder, setTestingOrder] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const { courierData, loading: courierLoading, fetchCourierData } = useCourierData()
  const { isEnabled: notificationsEnabled } = useNotificationSettings()

  // Real-time SSE connection
  const { connected: realtimeConnected, reconnect: reconnectRealtime } = useRealtimeStats({
    onNewOrder: () => {
      fetchCourierData(true)
    },
    onCourierAssigned: () => {
      fetchCourierData(true)
    }
  })

  const [config, setConfig] = useState({
    platform: "muditakurye",
    enabled: false,
    testMode: true,
    apiUrl: "",
    apiKey: "",
    restaurantId: "",
    webhookOnlyMode: false,
    retryConfig: {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 300000,
      backoffMultiplier: 2,
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      timeout: 60000,
      resetTimeout: 120000,
    },
    logRetentionDays: 30,
    secureLogging: true,
  })
  const [connectionStatus, setConnectionStatus] = useState(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await courierAPI.getConfig("muditakurye")
      if (response.data.success) {
        const fetchedConfig = { ...response.data.config }

        // Replace encrypted values with masked placeholders
        // This prevents re-encryption of already encrypted values
        if (fetchedConfig.apiKey && fetchedConfig.apiKey.startsWith('enc:')) {
          fetchedConfig.apiKey = '***masked***'
        }
        if (fetchedConfig.apiSecret && fetchedConfig.apiSecret.startsWith('enc:')) {
          fetchedConfig.apiSecret = '***masked***'
        }

        setConfig((prev) => ({ ...prev, ...fetchedConfig }))
      }
    } catch (error) {
      // Config might not exist yet, use defaults
      console.log("Config not found, using defaults")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const response = await courierAPI.updateConfig("muditakurye", config)
      if (response.data.success) {
        toast({
          title: "Başarılı!",
          description: "Kurye ayarları kaydedildi",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Ayarlar kaydedilirken hata oluştu",
      })
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const response = await courierAPI.testConnection("muditakurye")
      if (response.data.success) {
        setConnectionStatus("success")
        toast({
          title: "Bağlantı Başarılı!",
          description: "MuditaKurye API'ye başarıyla bağlanıldı",
        })
      }
    } catch (error) {
      setConnectionStatus("failed")
      toast({
        variant: "destructive",
        title: "Bağlantı Başarısız",
        description: error.response?.data?.message || error.response?.data?.error?.message || "API bağlantısı kurulamadı",
      })
    } finally {
      setTesting(false)
    }
  }

  const handleTestOrder = async () => {
    if (!config.testMode) {
      toast({
        variant: "destructive",
        title: "Uyarı",
        description: "Test sipariş göndermek için önce Test Modu'nu aktif edin",
      })
      return
    }

    setTestingOrder(true)
    try {
      const response = await courierAPI.testOrder("muditakurye")
      if (response.data.success) {
        toast({
          title: "Test Sipariş Başarılı!",
          description: `Test sipariş gönderildi. External ID: ${response.data.data?.externalOrderId || 'N/A'}`,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Test Sipariş Başarısız",
        description: error.response?.data?.message || error.response?.data?.error?.message || "Test sipariş gönderilemedi",
      })
    } finally {
      setTestingOrder(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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
                  <BreadcrumbPage>MuditaKurye Ayarları</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Status Bar - Desktop Only */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Sistem Durumu:</span>
          </div>
          <Badge
            variant={courierData?.todaySummary?.totalDeliveries > 0 ? "default" : "secondary"}
            className="cursor-pointer"
            title={courierData?.todaySummary?.totalDeliveries > 0
              ? `Kurye Entegrasyonu Aktif - ${courierData.todaySummary.totalDeliveries} sipariş`
              : "Kurye entegrasyonu bağlantısı bekleniyor"}
          >
            <Truck className="h-3 w-3 mr-1" />
            {courierData?.todaySummary?.totalDeliveries > 0 ? "Kurye Bağlı" : "Kurye Bekliyor"}
          </Badge>
          <Badge
            variant={notificationsEnabled ? "outline" : "secondary"}
            className="cursor-pointer hover:bg-accent"
            onClick={() => setNotificationSettingsOpen(true)}
            title="Bildirim ayarlarını aç"
          >
            {notificationsEnabled ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Bildirim Aktif
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Bildirim Kapalı
              </>
            )}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Truck className="h-8 w-8" />
                Kurye Entegrasyonu Ayarları
              </h1>
              <p className="text-muted-foreground mt-1">
                MuditaKurye API yapılandırması ve entegrasyon ayarları
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchConfig}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
              <Button onClick={handleSaveConfig}>
                <Settings className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>

          {/* Tabs - Settings sayfasında kullanıyoruz */}
          <Tabs defaultValue="api" className="space-y-6">
            <TabsList>
              <TabsTrigger value="api">API Bağlantısı</TabsTrigger>
              <TabsTrigger value="advanced">Gelişmiş Ayarlar</TabsTrigger>
              <TabsTrigger value="logs">Log Yönetimi</TabsTrigger>
            </TabsList>

            {/* API Configuration Tab */}
            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Bağlantı Bilgileri</CardTitle>
                  <CardDescription>
                    MuditaKurye API credentials ve endpoint yapılandırması
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <Label htmlFor="enabled">Entegrasyon Aktif</Label>
                      <p className="text-sm text-muted-foreground">
                        Kurye entegrasyonunu etkinleştir/devre dışı bırak
                      </p>
                    </div>
                    <Switch
                      id="enabled"
                      checked={config.enabled}
                      onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                    />
                  </div>

                  {/* Test Mode */}
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <Label htmlFor="testMode">Test Modu</Label>
                      <p className="text-sm text-muted-foreground">
                        Gerçek sipariş göndermeden test yapın
                      </p>
                    </div>
                    <Switch
                      id="testMode"
                      checked={config.testMode}
                      onCheckedChange={(checked) => setConfig({ ...config, testMode: checked })}
                    />
                  </div>

                  <Separator />

                  {/* API URL */}
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl">API URL</Label>
                    <Input
                      id="apiUrl"
                      placeholder="https://api.muditakurye.com"
                      value={config.apiUrl}
                      onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                    />
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="••••••••••••••••"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    />
                  </div>

                  {/* Restaurant ID */}
                  <div className="space-y-2">
                    <Label htmlFor="restaurantId">Restaurant ID</Label>
                    <Input
                      id="restaurantId"
                      placeholder="Tulumbak Restaurant ID"
                      value={config.restaurantId}
                      onChange={(e) => setConfig({ ...config, restaurantId: e.target.value })}
                    />
                  </div>

                  <Separator />

                  {/* Test Connection & Test Order */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleTestConnection}
                        disabled={testing || !config.apiUrl || !config.apiKey}
                        variant="outline"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {testing ? "Test Ediliyor..." : "Bağlantıyı Test Et"}
                      </Button>

                      {connectionStatus === "success" && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Bağlantı Başarılı
                        </Badge>
                      )}
                      {connectionStatus === "failed" && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Bağlantı Başarısız
                        </Badge>
                      )}
                    </div>

                    {/* Test Order Button - Only visible when connection is successful */}
                    {connectionStatus === "success" && (
                      <div className="border-t pt-4">
                        <div className="flex items-start gap-4">
                          <Button
                            onClick={handleTestOrder}
                            disabled={testingOrder || !config.testMode}
                            variant="secondary"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            {testingOrder ? "Gönderiliyor..." : "Test Sipariş Gönder"}
                          </Button>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              {config.testMode ? (
                                <>✅ Test modu aktif - Gerçek teslimat oluşturulmaz</>
                              ) : (
                                <>⚠️ Test modu kapalı - Bu butonu kullanmak için Test Modu'nu aktif edin</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Circuit Breaker Ayarları
                  </CardTitle>
                  <CardDescription>
                    Hatalı API çağrılarını otomatik olarak engelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Circuit Breaker Aktif</Label>
                      <p className="text-sm text-muted-foreground">
                        Başarısız isteklerde otomatik devre kesici
                      </p>
                    </div>
                    <Switch
                      checked={config.circuitBreaker.enabled}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          circuitBreaker: { ...config.circuitBreaker, enabled: checked },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Hata Eşiği: {config.circuitBreaker.failureThreshold}</Label>
                    </div>
                    <Slider
                      value={[config.circuitBreaker.failureThreshold]}
                      onValueChange={([value]) =>
                        setConfig({
                          ...config,
                          circuitBreaker: { ...config.circuitBreaker, failureThreshold: value },
                        })
                      }
                      min={3}
                      max={10}
                      step={1}
                    />
                    <p className="text-sm text-muted-foreground">
                      Bu kadar hatadan sonra circuit breaker açılır
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Retry Ayarları
                  </CardTitle>
                  <CardDescription>Başarısız istekler için yeniden deneme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Maksimum Deneme: {config.retryConfig.maxRetries}</Label>
                    <Slider
                      value={[config.retryConfig.maxRetries]}
                      onValueChange={([value]) =>
                        setConfig({
                          ...config,
                          retryConfig: { ...config.retryConfig, maxRetries: value },
                        })
                      }
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Backoff Çarpanı: {config.retryConfig.backoffMultiplier}x</Label>
                    <Slider
                      value={[config.retryConfig.backoffMultiplier]}
                      onValueChange={([value]) =>
                        setConfig({
                          ...config,
                          retryConfig: { ...config.retryConfig, backoffMultiplier: value },
                        })
                      }
                      min={1}
                      max={5}
                      step={0.5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Her deneme arasındaki bekleme süresi bu kadar katlanır
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab - Real-time Log Viewer */}
            <TabsContent value="logs" className="space-y-4">
              <LogViewer />

              {/* Log Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Log Ayarları
                  </CardTitle>
                  <CardDescription>
                    Log kayıt ve güvenlik ayarları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <Label>Güvenli Log Modu</Label>
                      <p className="text-sm text-muted-foreground">
                        Hassas verileri (API key, token) loglarda maskele
                      </p>
                    </div>
                    <Switch
                      checked={config.secureLogging}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, secureLogging: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Log Saklama Süresi</Label>
                    <Select
                      value={config.logRetentionDays.toString()}
                      onValueChange={(value) =>
                        setConfig({ ...config, logRetentionDays: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Gün</SelectItem>
                        <SelectItem value="30">30 Gün</SelectItem>
                        <SelectItem value="60">60 Gün</SelectItem>
                        <SelectItem value="90">90 Gün</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Loglar bu süreden sonra otomatik silinir
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Notification Settings Modal */}
        <NotificationSettingsModal
          open={notificationSettingsOpen}
          onOpenChange={setNotificationSettingsOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, BellOff, Volume2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"
import { useState } from "react"

export function NotificationSettingsModal({ open, onOpenChange }) {
  const {
    permission,
    settings,
    sounds,
    types,
    requestPermission,
    toggleNotifications,
    toggleNotificationType,
    changeSound,
    playSound,
    isEnabled,
    canEnable,
  } = useNotificationSettings()

  const [requesting, setRequesting] = useState(false)

  const handleToggleNotifications = async (enabled) => {
    if (enabled && permission !== 'granted') {
      setRequesting(true)
      try {
        await requestPermission()
      } catch (error) {
        console.error('Permission request failed:', error)
      } finally {
        setRequesting(false)
      }
    } else {
      await toggleNotifications(enabled)
    }
  }

  const getPermissionStatus = () => {
    if (permission === 'granted') {
      return {
        variant: 'default',
        icon: CheckCircle2,
        title: 'Bildirim İzni Verildi',
        description: 'Tarayıcınız bildirim gösterebilir',
      }
    } else if (permission === 'denied') {
      return {
        variant: 'destructive',
        icon: BellOff,
        title: 'Bildirim İzni Reddedildi',
        description: 'Tarayıcı ayarlarından bildirimleri açmanız gerekiyor',
      }
    } else {
      return {
        variant: 'default',
        icon: AlertCircle,
        title: 'Bildirim İzni Gerekli',
        description: 'Bildirimleri etkinleştirmek için izin vermeniz gerekiyor',
      }
    }
  }

  if (!canEnable) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bildirim Ayarları</DialogTitle>
            <DialogDescription>
              Tarayıcınız bildirim özelliğini desteklemiyor
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bu tarayıcı bildirim özelliğini desteklemiyor. Lütfen modern bir tarayıcı kullanın (Chrome, Firefox, Edge, Safari).
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  const permissionStatus = getPermissionStatus()
  const StatusIcon = permissionStatus.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Ayarları
          </DialogTitle>
          <DialogDescription>
            Sipariş ve sistem bildirimlerini özelleştirin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Permission Status */}
          <Alert variant={permissionStatus.variant === 'destructive' ? 'destructive' : 'default'}>
            <StatusIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">{permissionStatus.title}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {permissionStatus.description}
              </div>
            </AlertDescription>
          </Alert>

          {/* Enable/Disable Notifications */}
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="notifications-enabled" className="text-base font-medium">
                Bildirimleri Etkinleştir
              </Label>
              <p className="text-sm text-muted-foreground">
                Yeni siparişler ve güncellemeler için masaüstü bildirimleri al
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={isEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={requesting || permission === 'denied'}
            />
          </div>

          {permission === 'denied' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  <strong>Tarayıcı Ayarlarından İzin Verin:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Tarayıcı adres çubuğundaki kilit ikonuna tıklayın</li>
                    <li>"Site ayarları" veya "İzinler"i seçin</li>
                    <li>"Bildirimler" bölümünden "İzin ver"i seçin</li>
                    <li>Sayfayı yenileyin</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Notification Sound */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notification-sound" className="text-base font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Bildirim Sesi
              </Label>
            </div>
            <Select
              value={settings.sound}
              onValueChange={changeSound}
              disabled={!isEnabled}
            >
              <SelectTrigger id="notification-sound">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sounds.map((sound) => (
                  <SelectItem key={sound.id} value={sound.id}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => playSound()}
              disabled={!isEnabled || settings.sound === 'none'}
              className="w-full"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Sesi Önizle
            </Button>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Bildirim Türleri</Label>
            <p className="text-sm text-muted-foreground">
              Hangi olaylar için bildirim almak istediğinizi seçin
            </p>
            <div className="space-y-3">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-start justify-between space-x-2 rounded-lg border p-3"
                >
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`notify-${type.id}`} className="text-sm font-medium cursor-pointer">
                      {type.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <Switch
                    id={`notify-${type.id}`}
                    checked={settings.enabledTypes.includes(type.id)}
                    onCheckedChange={() => toggleNotificationType(type.id)}
                    disabled={!isEnabled}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Test Notification */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={!isEnabled}
              onClick={() => {
                if (isEnabled) {
                  new Notification('Test Bildirimi', {
                    body: 'Bildirimler başarıyla çalışıyor! 🎉',
                    icon: '/icon-192x192.png',
                  })
                  playSound()
                }
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Bildirimi Gönder
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Ayarlarınızın çalıştığını kontrol edin
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

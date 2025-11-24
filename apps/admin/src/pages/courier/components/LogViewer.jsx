import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { courierAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  RefreshCw,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Search,
  Download,
} from "lucide-react"

export function LogViewer() {
  const { toast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [logType, setLogType] = useState("combined")
  const [filter, setFilter] = useState("")
  const [maxLines, setMaxLines] = useState(100)
  const logContainerRef = useRef(null)
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    fetchLogs()
  }, [logType])

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchLogs(true) // silent refresh
      }, 3000) // 3 saniye
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, logType, filter, maxLines])

  const fetchLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await courierAPI.getLogs({
        type: logType,
        lines: maxLines,
        filter: filter || undefined,
      })

      if (response.data.success) {
        setLogs(response.data.logs)

        // Auto-scroll to bottom on new logs
        if (logContainerRef.current && autoRefresh) {
          setTimeout(() => {
            logContainerRef.current?.scrollTo({
              top: logContainerRef.current.scrollHeight,
              behavior: 'smooth'
            })
          }, 100)
        }
      }
    } catch (error) {
      if (!silent) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Loglar yüklenirken hata oluştu",
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm("Tüm logları silmek istediğinize emin misiniz?")) return

    try {
      const response = await courierAPI.clearLogs(logType)
      if (response.data.success) {
        setLogs([])
        toast({
          title: "Başarılı!",
          description: "Loglar temizlendi",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Loglar temizlenirken hata oluştu",
      })
    }
  }

  const getLevelBadge = (level) => {
    const levelMap = {
      error: { variant: "destructive", icon: XCircle, label: "ERROR" },
      warn: { variant: "outline", icon: AlertCircle, label: "WARN", className: "border-yellow-500 text-yellow-700" },
      info: { variant: "secondary", icon: Info, label: "INFO" },
      debug: { variant: "outline", icon: FileText, label: "DEBUG" },
      http: { variant: "outline", icon: CheckCircle, label: "HTTP", className: "border-blue-500 text-blue-700" },
    }

    const config = levelMap[level] || levelMap.info
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className || ""}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const exportLogs = () => {
    const logText = logs.map(log =>
      `[${formatTimestamp(log.timestamp)}] [${log.level?.toUpperCase()}] ${log.message}${log.error ? `\n${log.error}` : ''}${log.stack ? `\n${log.stack}` : ''}`
    ).join('\n\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `courier-logs-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log Görüntüleyici
          </CardTitle>
          <CardDescription>
            Kurye entegrasyonu loglarını gerçek zamanlı izleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Log Type */}
            <div className="space-y-2">
              <Label>Log Tipi</Label>
              <Select value={logType} onValueChange={setLogType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combined">Tüm Loglar</SelectItem>
                  <SelectItem value="error">Sadece Hatalar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Lines */}
            <div className="space-y-2">
              <Label>Satır Sayısı</Label>
              <Select
                value={maxLines.toString()}
                onValueChange={(val) => setMaxLines(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 satır</SelectItem>
                  <SelectItem value="100">100 satır</SelectItem>
                  <SelectItem value="200">200 satır</SelectItem>
                  <SelectItem value="500">500 satır</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter */}
            <div className="space-y-2">
              <Label>Filtrele</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Anahtar kelime..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Auto Refresh */}
            <div className="space-y-2">
              <Label>Otomatik Yenileme</Label>
              <div className="flex items-center gap-2 border p-2 rounded-lg">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <span className="text-sm">
                  {autoRefresh ? "Aktif (3s)" : "Kapalı"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearLogs}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Loglar ({logs.length})
            </CardTitle>
            {autoRefresh && (
              <Badge variant="secondary" className="animate-pulse">
                <RefreshCw className="h-3 w-3 mr-1" />
                Canlı
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={logContainerRef}
            className="bg-slate-900 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[600px] space-y-2"
          >
            {logs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Henüz log bulunmuyor</p>
              </div>
            ) : (
              logs.map((log) => {
                const levelColors = {
                  error: { border: "border-red-500", text: "text-red-300", bg: "hover:bg-red-950/30" },
                  warn: { border: "border-yellow-500", text: "text-yellow-300", bg: "hover:bg-yellow-950/30" },
                  info: { border: "border-blue-500", text: "text-blue-300", bg: "hover:bg-blue-950/30" },
                  http: { border: "border-green-500", text: "text-green-300", bg: "hover:bg-green-950/30" },
                  debug: { border: "border-gray-500", text: "text-gray-300", bg: "hover:bg-gray-800" },
                }
                const colors = levelColors[log.level] || levelColors.info

                return (
                  <div
                    key={log.id}
                    className={`border-b border-slate-700 pb-2 mb-2 ${colors.bg} p-2 rounded transition-colors`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-slate-400 text-[10px] min-w-[140px] font-semibold">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {getLevelBadge(log.level)}
                      <span className="text-cyan-400 text-[10px] font-semibold">
                        [{log.service || "system"}]
                      </span>
                    </div>
                    <div className={`pl-2 border-l-2 ${colors.border}`}>
                      <p className={`${colors.text} font-medium`}>{log.message}</p>
                      {log.error && (
                        <p className="text-red-400 mt-1 text-[10px] font-semibold">
                          Error: {typeof log.error === 'object' ? JSON.stringify(log.error) : log.error}
                        </p>
                      )}
                      {log.stack && (
                        <pre className="text-red-300 mt-1 text-[9px] overflow-x-auto bg-slate-950/50 p-2 rounded">
                          {log.stack}
                        </pre>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="text-slate-300 mt-1 text-[9px] bg-slate-950/50 p-2 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 İpucu:</strong> Otomatik yenileme aktifken loglar 3 saniyede bir güncellenir.
            Hata ayıklama için "Sadece Hatalar" filtresini kullanabilirsiniz. Backend terminal'de
            görünen tüm hatalar burada detaylı olarak görüntülenir.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

/**
 * Email Logs Page - Real-time log viewer
 * Clean, professional log monitoring with filtering
 */
export default function EmailLogs() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    status: "all",
    trigger: "all",
    to: "",
  })
  const [selectedLog, setSelectedLog] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters])

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchLogs(true) // silent refresh
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh, pagination.page, filters])

  const fetchLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
        ...(filters.trigger && filters.trigger !== "all" && { trigger: filters.trigger }),
        ...(filters.to && { to: filters.to }),
      })

      const response = await api.get(`/api/email/logs?${params}`)
      if (response.data.success) {
        setLogs(response.data.logs)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      if (!silent) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Email logları yüklenemedi",
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const viewLogDetails = async (logId) => {
    try {
      const response = await api.get(`/api/email/logs/${logId}`)
      if (response.data.success) {
        setSelectedLog(response.data.log)
        setDialogOpen(true)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Log detayları yüklenemedi",
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Gönderildi
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Başarısız
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTriggerLabel = (trigger) => {
    const labels = {
      orderCreated: "Sipariş Oluşturuldu",
      orderStatusUpdate: "Sipariş Durumu",
      courierAssigned: "Kurye Atandı",
      orderDelivered: "Sipariş Teslim Edildi",
      paymentReceived: "Ödeme Alındı",
    }
    return labels[trigger] || trigger
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR")
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
                  <BreadcrumbPage>Email Logları</BreadcrumbPage>
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
                <FileText className="h-8 w-8" />
                Email Logları
              </h1>
              <p className="text-muted-foreground mt-1">
                Gönderilen tüm emaillerin kayıtları ve durumları
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Otomatik Yenileme Açık" : "Otomatik Yenileme"}
              </Button>
              <Button onClick={() => fetchLogs()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="sent">Gönderildi</SelectItem>
                      <SelectItem value="failed">Başarısız</SelectItem>
                      <SelectItem value="pending">Bekliyor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tetikleyici</Label>
                  <Select
                    value={filters.trigger}
                    onValueChange={(value) =>
                      setFilters({ ...filters, trigger: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="orderCreated">Sipariş Oluşturuldu</SelectItem>
                      <SelectItem value="orderStatusUpdate">Sipariş Durumu</SelectItem>
                      <SelectItem value="courierAssigned">Kurye Atandı</SelectItem>
                      <SelectItem value="orderDelivered">Teslim Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alıcı Email</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="email@example.com"
                      className="pl-8"
                      value={filters.to}
                      onChange={(e) =>
                        setFilters({ ...filters, to: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Kayıtları ({pagination.total})</CardTitle>
              <CardDescription>
                Son gönderilen emailler ve durumları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Alıcı</TableHead>
                    <TableHead>Konu</TableHead>
                    <TableHead>Tetikleyici</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>{log.to}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTriggerLabel(log.trigger)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewLogDetails(log._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Sayfa {pagination.page} / {pagination.pages} ({pagination.total}{" "}
                  kayıt)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Detayları</DialogTitle>
              <DialogDescription>
                Gönderilen email'in tam içeriği ve detayları
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tarih</Label>
                    <p className="font-mono text-sm">
                      {formatDate(selectedLog.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Durum</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Gönderen</Label>
                    <p className="text-sm">{selectedLog.from}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Alıcı</Label>
                    <p className="text-sm">{selectedLog.to}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Konu</Label>
                    <p className="text-sm">{selectedLog.subject}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Tetikleyici</Label>
                    <Badge variant="outline">
                      {getTriggerLabel(selectedLog.trigger)}
                    </Badge>
                  </div>
                </div>

                {selectedLog.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Label className="text-xs text-red-600 font-semibold">
                      Hata Mesajı
                    </Label>
                    <p className="text-sm text-red-700 mt-1 font-mono">
                      {selectedLog.error}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Email İçeriği (HTML Preview)
                  </Label>
                  <div className="mt-2 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                    <iframe
                      srcDoc={selectedLog.htmlContent}
                      className="w-full h-96 border-0"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

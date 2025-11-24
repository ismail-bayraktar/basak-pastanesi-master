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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TicketPercent,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { backendUrl } from "@/App"

export default function Coupons() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "yüzde",
    value: 0,
    minCart: 0,
    validFrom: "",
    validUntil: "",
    usageLimit: 0,
    active: true,
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get(`${backendUrl}/api/coupon/list`, {
        headers: { token },
      })

      if (response.data.success) {
        setCoupons(response.data.coupons)
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast({
        title: "Hata",
        description: "Kuponlar yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        validFrom: new Date(formData.validFrom).getTime(),
        validUntil: new Date(formData.validUntil).getTime(),
        usageLimit: parseInt(formData.usageLimit),
        minCart: parseFloat(formData.minCart),
        value: parseFloat(formData.value),
      }

      if (editingCoupon) {
        // Update
        const response = await axios.put(
          `${backendUrl}/api/coupon/update`,
          { id: editingCoupon._id, ...payload },
          { headers: { token } }
        )

        if (response.data.success) {
          toast({
            title: "Başarılı",
            description: "Kupon güncellendi",
          })
          fetchCoupons()
          handleCloseModal()
        }
      } else {
        // Create
        const response = await axios.post(
          `${backendUrl}/api/coupon/create`,
          payload,
          { headers: { token } }
        )

        if (response.data.success) {
          toast({
            title: "Başarılı",
            description: "Kupon oluşturuldu",
          })
          fetchCoupons()
          handleCloseModal()
        }
      }
    } catch (error) {
      console.error("Error saving coupon:", error)
      toast({
        title: "Hata",
        description: error.response?.data?.message || "Kupon kaydedilemedi",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Bu kuponu silmek istediğinizden emin misiniz?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await axios.delete(`${backendUrl}/api/coupon/remove`, {
        headers: { token },
        data: { id },
      })

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Kupon silindi",
        })
        fetchCoupons()
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Hata",
        description: error.response?.data?.message || "Kupon silinemedi",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minCart: coupon.minCart,
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit,
      active: coupon.active,
    })
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingCoupon(null)
    setFormData({
      code: "",
      type: "yüzde",
      value: 0,
      minCart: 0,
      validFrom: "",
      validUntil: "",
      usageLimit: 0,
      active: true,
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date()
  }

  const stats = {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter((c) => c.active && !isExpired(c.validUntil)).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usageCount, 0),
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
                    <BreadcrumbLink href="#">Tulumbak Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Kuponlar</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Badge variant="outline" className="text-sm">
              {stats.totalCoupons} Kupon
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">İndirim Kuponları</h1>
              <p className="text-muted-foreground">
                İndirim kuponları oluşturun ve yönetin
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchCoupons} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Yenile
              </Button>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCoupon ? "Kupon Düzenle" : "Yeni Kupon Oluştur"}
                    </DialogTitle>
                    <DialogDescription>
                      Müşterileriniz için indirim kuponu oluşturun
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Kupon Kodu *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value.toUpperCase() })
                          }
                          placeholder="INDIRIM20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">İndirim Tipi *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yüzde">Yüzde (%)</SelectItem>
                            <SelectItem value="tutar">Tutar (₺)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value">
                          İndirim Değeri * {formData.type === "yüzde" ? "(%)" : "(₺)"}
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          value={formData.value}
                          onChange={(e) =>
                            setFormData({ ...formData, value: parseFloat(e.target.value) })
                          }
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minCart">Minimum Sepet Tutarı (₺)</Label>
                        <Input
                          id="minCart"
                          type="number"
                          value={formData.minCart}
                          onChange={(e) =>
                            setFormData({ ...formData, minCart: parseFloat(e.target.value) })
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="validFrom">Başlangıç Tarihi *</Label>
                        <Input
                          id="validFrom"
                          type="datetime-local"
                          value={formData.validFrom}
                          onChange={(e) =>
                            setFormData({ ...formData, validFrom: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="validUntil">Bitiş Tarihi *</Label>
                        <Input
                          id="validUntil"
                          type="datetime-local"
                          value={formData.validUntil}
                          onChange={(e) =>
                            setFormData({ ...formData, validUntil: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usageLimit">Kullanım Limiti (0 = Sınırsız)</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={formData.usageLimit}
                          onChange={(e) =>
                            setFormData({ ...formData, usageLimit: parseInt(e.target.value) })
                          }
                          min="0"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label>Aktif</Label>
                        <Switch
                          checked={formData.active}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, active: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={handleCloseModal}>
                        İptal
                      </Button>
                      <Button type="submit">
                        {editingCoupon ? "Güncelle" : "Oluştur"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kupon</CardTitle>
                <TicketPercent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCoupons}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Kupon</CardTitle>
                <TicketPercent className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCoupons}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanım</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsage}</div>
              </CardContent>
            </Card>
          </div>

          {/* Coupons Table */}
          <Card>
            <CardHeader>
              <CardTitle>Kupon Listesi</CardTitle>
              <CardDescription>Tüm indirim kuponları ve kullanım bilgileri</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <TicketPercent className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Kupon bulunamadı</p>
                  <p className="text-sm text-muted-foreground">
                    İlk kuponunuzu oluşturmak için "Yeni Kupon" butonuna tıklayın
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kupon Kodu</TableHead>
                      <TableHead>İndirim</TableHead>
                      <TableHead>Min. Sepet</TableHead>
                      <TableHead>Geçerlilik</TableHead>
                      <TableHead className="text-center">Kullanım</TableHead>
                      <TableHead className="text-center">Durum</TableHead>
                      <TableHead className="text-center">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell>
                          <div className="font-mono font-bold">{coupon.code}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {coupon.type === "yüzde"
                              ? `%${coupon.value}`
                              : formatCurrency(coupon.value)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(coupon.minCart)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <div>{formatDate(coupon.validFrom)}</div>
                              <div className="text-muted-foreground">
                                {formatDate(coupon.validUntil)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <span className="font-medium">{coupon.usageCount}</span>
                            {coupon.usageLimit > 0 && (
                              <span className="text-muted-foreground"> / {coupon.usageLimit}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isExpired(coupon.validUntil) ? (
                            <Badge variant="destructive">Süresi Doldu</Badge>
                          ) : !coupon.active ? (
                            <Badge variant="secondary">Pasif</Badge>
                          ) : (
                            <Badge variant="default">Aktif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleEdit(coupon)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(coupon._id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

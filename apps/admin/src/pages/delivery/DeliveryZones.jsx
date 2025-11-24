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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export default function DeliveryZones() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    districts: "",
    fee: 0,
    minOrder: 0,
    freeShippingThreshold: 0,
    enabled: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/delivery/zones")
      if (response.data.success) {
        setZones(response.data.zones || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Teslimat bölgeleri yüklenemedi",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        districts: formData.districts.split(",").map((d) => d.trim()).filter(Boolean),
        fee: parseFloat(formData.fee),
        minOrder: parseFloat(formData.minOrder),
        freeShippingThreshold: parseFloat(formData.freeShippingThreshold),
      }

      if (editingZone) {
        const response = await api.put(`/api/delivery/zones/${editingZone._id}`, payload)
        if (response.data.success) {
          toast({
            title: "Başarılı",
            description: "Teslimat bölgesi güncellendi",
          })
        }
      } else {
        const response = await api.post("/api/delivery/zones", payload)
        if (response.data.success) {
          toast({
            title: "Başarılı",
            description: "Teslimat bölgesi eklendi",
          })
        }
      }

      setDialogOpen(false)
      setEditingZone(null)
      resetForm()
      fetchZones()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "İşlem başarısız",
      })
    }
  }

  const handleEdit = (zone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      districts: zone.districts.join(", "),
      fee: zone.fee,
      minOrder: zone.minOrder || 0,
      freeShippingThreshold: zone.freeShippingThreshold || 0,
      enabled: zone.enabled,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Bu teslimat bölgesini silmek istediğinizden emin misiniz?")) return

    try {
      const response = await api.delete(`/api/delivery/zones/${id}`)
      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Teslimat bölgesi silindi",
        })
        fetchZones()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Silme işlemi başarısız",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      districts: "",
      fee: 0,
      minOrder: 0,
      freeShippingThreshold: 0,
      enabled: true,
    })
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
                  <BreadcrumbPage>Teslimat Bölgeleri</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teslimat Bölgeleri</h1>
              <p className="text-muted-foreground mt-1">
                Teslimat bölgelerini ve ücretlerini yönetin
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingZone(null)
                resetForm()
                setDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Bölge
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bölge Listesi</CardTitle>
              <CardDescription>Tüm teslimat bölgeleri ve ayarları</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : zones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz teslimat bölgesi eklenmemiş</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bölge Adı</TableHead>
                      <TableHead>İlçeler</TableHead>
                      <TableHead>Teslimat Ücreti</TableHead>
                      <TableHead>Min. Sipariş</TableHead>
                      <TableHead>Ücretsiz Kargo</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map((zone) => (
                      <TableRow key={zone._id}>
                        <TableCell className="font-medium">{zone.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {zone.districts.slice(0, 3).map((district) => (
                              <Badge key={district} variant="outline" className="text-xs">
                                {district}
                              </Badge>
                            ))}
                            {zone.districts.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{zone.districts.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {zone.fee === 0 ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Ücretsiz
                            </Badge>
                          ) : (
                            `₺${zone.fee.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>₺{zone.minOrder?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          {zone.freeShippingThreshold > 0
                            ? `₺${zone.freeShippingThreshold.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={zone.enabled ? "default" : "secondary"}>
                            {zone.enabled ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(zone)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(zone._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Bölge Düzenle" : "Yeni Teslimat Bölgesi"}
            </DialogTitle>
            <DialogDescription>
              Teslimat bölgesi bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Bölge Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="districts">İlçeler (virgülle ayırın)</Label>
                <Input
                  id="districts"
                  value={formData.districts}
                  onChange={(e) => setFormData({ ...formData, districts: e.target.value })}
                  placeholder="Örn: Çankaya, Keçiören, Yenimahalle"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fee">Teslimat Ücreti (₺)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    0 = Ücretsiz teslimat
                  </p>
                </div>

                <div>
                  <Label htmlFor="minOrder">Min. Sipariş (₺)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="freeShipping">Ücretsiz Kargo Eşiği (₺)</Label>
                <Input
                  id="freeShipping"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.freeShippingThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, freeShippingThreshold: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bu tutarın üzerindeki siparişlerde kargo ücretsiz
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enabled: checked })
                  }
                />
                <Label htmlFor="enabled">Bölgeyi aktif et</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingZone(null)
                  resetForm()
                }}
              >
                İptal
              </Button>
              <Button type="submit">
                {editingZone ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

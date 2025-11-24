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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

const WEEKDAYS = [
  { value: "monday", label: "Pazartesi" },
  { value: "tuesday", label: "Salı" },
  { value: "wednesday", label: "Çarşamba" },
  { value: "thursday", label: "Perşembe" },
  { value: "friday", label: "Cuma" },
  { value: "saturday", label: "Cumartesi" },
  { value: "sunday", label: "Pazar" },
]

export default function TimeSlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    capacity: 10,
    activeDays: [],
    enabled: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/delivery/timeslots")
      if (response.data.success) {
        setSlots(response.data.slots || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Zaman dilimleri yüklenemedi",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen geçerli saat formatı girin (HH:MM)",
      })
      return
    }

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity),
      }

      if (editingSlot) {
        const response = await api.put(`/api/delivery/timeslots/${editingSlot._id}`, payload)
        if (response.data.success) {
          toast({
            title: "Başarılı",
            description: "Zaman dilimi güncellendi",
          })
        }
      } else {
        const response = await api.post("/api/delivery/timeslots", payload)
        if (response.data.success) {
          toast({
            title: "Başarılı",
            description: "Zaman dilimi eklendi",
          })
        }
      }

      setDialogOpen(false)
      setEditingSlot(null)
      resetForm()
      fetchSlots()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "İşlem başarısız",
      })
    }
  }

  const handleEdit = (slot) => {
    setEditingSlot(slot)
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      activeDays: slot.activeDays || [],
      enabled: slot.enabled,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Bu zaman dilimini silmek istediğinizden emin misiniz?")) return

    try {
      const response = await api.delete(`/api/delivery/timeslots/${id}`)
      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Zaman dilimi silindi",
        })
        fetchSlots()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Silme işlemi başarısız",
      })
    }
  }

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      activeDays: prev.activeDays.includes(day)
        ? prev.activeDays.filter((d) => d !== day)
        : [...prev.activeDays, day],
    }))
  }

  const resetForm = () => {
    setFormData({
      startTime: "",
      endTime: "",
      capacity: 10,
      activeDays: [],
      enabled: true,
    })
  }

  const getDayLabel = (dayValue) => {
    return WEEKDAYS.find((d) => d.value === dayValue)?.label || dayValue
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
                  <BreadcrumbPage>Teslimat Zaman Dilimleri</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teslimat Zaman Dilimleri</h1>
              <p className="text-muted-foreground mt-1">
                Teslimat saatlerini ve kapasitelerini yönetin
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingSlot(null)
                resetForm()
                setDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Zaman Dilimi
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Zaman Dilimi Listesi</CardTitle>
              <CardDescription>Tüm teslimat zaman dilimleri ve ayarları</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz zaman dilimi eklenmemiş</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zaman Aralığı</TableHead>
                      <TableHead>Kapasite</TableHead>
                      <TableHead>Aktif Günler</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.map((slot) => (
                      <TableRow key={slot._id}>
                        <TableCell className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{slot.capacity} sipariş</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {slot.activeDays && slot.activeDays.length > 0 ? (
                              <>
                                {slot.activeDays.slice(0, 3).map((day) => (
                                  <Badge key={day} variant="secondary" className="text-xs">
                                    {getDayLabel(day)}
                                  </Badge>
                                ))}
                                {slot.activeDays.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{slot.activeDays.length - 3}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Tüm günler
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={slot.enabled ? "default" : "secondary"}>
                            {slot.enabled ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot._id)}
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
              {editingSlot ? "Zaman Dilimi Düzenle" : "Yeni Zaman Dilimi"}
            </DialogTitle>
            <DialogDescription>
              Teslimat zaman dilimi bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Başlangıç Saati</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">Bitiş Saati</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="capacity">Kapasite (Sipariş Sayısı)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bu zaman diliminde kabul edilecek maksimum sipariş sayısı
                </p>
              </div>

              <div>
                <Label>Aktif Günler</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-muted"
                      onClick={() => toggleDay(day.value)}
                    >
                      <Switch
                        checked={formData.activeDays.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <Label className="cursor-pointer text-sm">{day.label}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Hiçbir gün seçilmezse tüm günlerde aktif olur
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
                <Label htmlFor="enabled">Zaman dilimini aktif et</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingSlot(null)
                  resetForm()
                }}
              >
                İptal
              </Button>
              <Button type="submit">
                {editingSlot ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

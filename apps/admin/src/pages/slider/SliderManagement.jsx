import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sliderAPI } from "@/lib/api"
import { SliderList } from "./components/SliderList"
import { SliderForm } from "./components/SliderForm"

export default function SliderManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("list")
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSlider, setEditingSlider] = useState(null)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      setLoading(true)
      const response = await sliderAPI.getAll()
      if (response.data.success) {
        setSliders(response.data.sliders || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Sliderler yüklenirken hata oluştu",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (slider) => {
    setEditingSlider(slider)
    setActiveTab("form")
  }

  const handleDelete = async (id) => {
    if (!confirm("Bu sliderı silmek istediğinize emin misiniz?")) return

    try {
      const response = await sliderAPI.remove(id)
      if (response.data.success) {
        toast({
          title: "Başarılı!",
          description: "Slider silindi",
        })
        fetchSliders()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Slider silinirken hata oluştu",
      })
    }
  }

  const handleDuplicate = (slider) => {
    const duplicatedSlider = {
      ...slider,
      _id: undefined,
      title: `${slider.title} (Kopyası)`,
      order: sliders.length,
    }
    setEditingSlider(duplicatedSlider)
    setActiveTab("form")
  }

  const handleToggleActive = async (slider) => {
    try {
      const formData = new FormData()
      formData.append("isActive", !slider.isActive)

      const response = await sliderAPI.update(slider._id, formData)
      if (response.data.success) {
        toast({
          title: "Başarılı!",
          description: `Slider ${!slider.isActive ? "aktif" : "pasif"} hale getirildi`,
        })
        fetchSliders()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Slider durumu güncellenirken hata oluştu",
      })
    }
  }

  const handleFormSuccess = () => {
    fetchSliders()
    setEditingSlider(null)
    setActiveTab("list")
  }

  const handleFormCancel = () => {
    setEditingSlider(null)
    setActiveTab("list")
  }

  const handleNewSlider = () => {
    setEditingSlider(null)
    setActiveTab("form")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Admin Panel
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Slider Yönetimi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Slider Yönetimi</h1>
              <p className="text-muted-foreground">
                Ana sayfa slider'larını yönetin
              </p>
            </div>
            <Button onClick={handleNewSlider}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Slider
            </Button>
          </div>

          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="list">Slider Listesi ({sliders.length})</TabsTrigger>
                <TabsTrigger value="form">
                  {editingSlider ? "Slider Düzenle" : "Yeni Slider"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-6">
                <SliderList
                  sliders={sliders}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onToggleActive={handleToggleActive}
                  onReorder={fetchSliders}
                />
              </TabsContent>

              <TabsContent value="form" className="mt-6">
                <SliderForm
                  slider={editingSlider}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { useState, useEffect, useCallback } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { mediaAPI } from "@/lib/api"
import { MediaUploader } from "./components/MediaUploader"
import { MediaItem } from "./components/MediaItem"

export default function MediaLibrary() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    pages: 1
  })

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const { data } = await mediaAPI.getAll(params)

      if (data.success) {
        setMedia(data.media)
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }))
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, category])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1
  }

  const handleCategoryChange = (val) => {
    setCategory(val)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleRefresh = () => {
    fetchMedia()
  }

  const handleUploadSuccess = () => {
    // Reset to page 1 and refresh
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchMedia()
  }

  const handleItemDelete = (id) => {
    setMedia(prev => prev.filter(m => m.id !== id))
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
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Medya Kütüphanesi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Medya Kütüphanesi</h1>
              <p className="text-muted-foreground">
                Görsellerinizi yönetin ve düzenleyin.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh} title="Yenile">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <MediaUploader onSuccess={handleUploadSuccess} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/30 p-4 rounded-lg border">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                className="pl-9 bg-background"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="general">Genel</SelectItem>
                <SelectItem value="products">Ürünler</SelectItem>
                <SelectItem value="sliders">Slider</SelectItem>
                <SelectItem value="blogs">Blog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {loading && media.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>Medya bulunamadı.</p>
              <Button variant="link" onClick={() => setSearch('')}>Aramayı temizle</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {media.map((item) => (
                  <MediaItem
                    key={item.id}
                    item={item}
                    onDelete={handleItemDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Önceki
                  </Button>
                  <span className="text-sm font-medium">
                    Sayfa {pagination.page} / {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

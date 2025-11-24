import { useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, FolderTree, Loader2, Upload, X } from "lucide-react"
import useCategories from "@/hooks/useCategories"
import { Textarea } from "@/components/ui/textarea"
import CategoryEditSheet from "@/components/CategoryEditSheet"
import CategoryAddSheet from "@/components/CategoryAddSheet"

export default function Categories() {
  const { toast } = useToast()
  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    removeCategory,
    toggleActive: toggleCategoryActive,
    refresh,
  } = useCategories()

  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleEdit = (category) => {
    setEditingCategory(category)
    setEditSheetOpen(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)

    try {
      const result = await removeCategory(categoryToDelete._id)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.message || "Kategori silindi",
        })
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: result.message || "Kategori silinemedi",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openDeleteDialog = (category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleToggleActive = async (category) => {
    try {
      const result = await toggleCategoryActive(category._id)

      if (result.success) {
        toast({
          title: "Güncellendi",
          description: result.message || `Kategori ${category.active ? "pasif" : "aktif"} yapıldı`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: result.message || "Durum değiştirilemedi",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
      })
    }
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
                  <BreadcrumbPage>Kategoriler</BreadcrumbPage>
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
                <FolderTree className="h-8 w-8" />
                Kategori Yönetimi
              </h1>
              <p className="text-muted-foreground mt-1">
                Ürün kategorilerini yönetin ve organize edin
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Yenile
              </Button>
              <Button size="sm" onClick={() => setAddSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kategori
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-sm text-red-900">
                  <strong>Hata:</strong> {error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Kategoriler ({categories.length})</CardTitle>
              <CardDescription>Veritabanındaki tüm ürün kategorileri</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold">Yükleniyor...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kategoriler getiriliyor
                  </p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Kategori bulunamadı</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Başlamak için yeni bir kategori ekleyin
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Görsel</TableHead>
                      <TableHead>Kategori Adı</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>SEO</TableHead>
                      <TableHead>Ürün Sayısı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                              <FolderTree className="h-6 w-6" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {category.slug}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell>
                          {category.metaTitle || category.metaDescription ? (
                            <Badge variant="outline" className="bg-green-50">✓ SEO</Badge>
                          ) : (
                            <Badge variant="secondary">- SEO</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {category.productCount || 0} ürün
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={category.active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleActive(category)}
                          >
                            {category.active ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(category)}
                              disabled={category.productCount > 0}
                              title={category.productCount > 0 ? "Bu kategoriye ait ürünler var" : "Kategoriyi sil"}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Category Add Sheet */}
      <CategoryAddSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onSuccess={refresh}
      />

      {/* Category Edit Sheet */}
      <CategoryEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        category={editingCategory}
        onSuccess={refresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{categoryToDelete?.name}</strong> kategorisi kalıcı olarak silinecektir.
              {categoryToDelete?.productCount > 0 && (
                <span className="text-destructive font-medium">
                  {" "}Bu kategoriye ait {categoryToDelete.productCount} ürün var. Önce ürünleri başka kategoriye taşıyın.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={submitting || (categoryToDelete?.productCount > 0)}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}

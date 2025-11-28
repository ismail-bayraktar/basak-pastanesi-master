import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ProductEditSheet from "@/components/ProductEditSheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { productAPI } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react"
import { backendUrl } from "@/lib/api"

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  // If URL already starts with http/https (Cloudinary), return as is
  if (imageUrl.startsWith('http')) return imageUrl
  // Otherwise, prepend backend URL for local uploads
  return `${backendUrl}${imageUrl}`
}

export default function ProductList() {
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    basePrice: 0,
    stock: 0,
    bestseller: false,
    category: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Copy ID state
  const [copiedId, setCopiedId] = useState(null)

  // Inline editing state
  const [inlineEdit, setInlineEdit] = useState({
    productId: null,
    field: null,
    value: null,
    originalValue: null,
  })

  const categories = [
    "Taze Meyve",
    "Kuruyemiş",
    "Çikolata",
    "Atıştırmalık",
    "Özel Paketler",
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await productAPI.getAll()
      if (response.data.success) {
        // Backend returns { success: true, data: { products: [] } }
        setProducts(response.data.data?.products || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürünler yüklenirken hata oluştu",
      })
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await productAPI.remove(productToDelete._id)
      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Ürün silindi",
        })
        fetchProducts(true)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Ürün silinirken hata oluştu",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const openDeleteDialog = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name || "",
      basePrice: product.basePrice || 0,
      stock: product.stock || 0,
      bestseller: product.bestseller || false,
      category: product.category || "",
    })
    setEditDialogOpen(true)
  }

  const handleQuickEdit = async () => {
    try {
      const formData = new FormData()
      formData.append("id", editingProduct._id)
      formData.append("name", editForm.name)
      formData.append("basePrice", editForm.basePrice)
      formData.append("stock", editForm.stock)
      formData.append("bestseller", editForm.bestseller)
      formData.append("category", editForm.category)

      const response = await productAPI.update(formData)
      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Ürün güncellendi",
        })
        fetchProducts(true)
        setEditDialogOpen(false)
        setEditingProduct(null)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Ürün güncellenirken hata oluştu",
      })
    }
  }

  // Copy ID to clipboard
  const copyToClipboard = async (id) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      toast({
        title: "Kopyalandı!",
        description: "Ürün ID panoya kopyalandı",
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız oldu",
        variant: "destructive",
      })
    }
  }

  // Inline Editing Functions
  const startInlineEdit = (productId, field, currentValue) => {
    setInlineEdit({
      productId,
      field,
      value: currentValue,
      originalValue: currentValue,
    })
  }

  const cancelInlineEdit = () => {
    setInlineEdit({
      productId: null,
      field: null,
      value: null,
      originalValue: null,
    })
  }

  const saveInlineEdit = async () => {
    if (!inlineEdit.productId || !inlineEdit.field) return

    try {
      const response = await productAPI.quickUpdate(
        inlineEdit.productId,
        inlineEdit.field,
        inlineEdit.value
      )

      if (response.data.success) {
        // Update local state optimistically
        setProducts((prev) =>
          prev.map((p) =>
            p._id === inlineEdit.productId
              ? { ...p, [inlineEdit.field]: inlineEdit.value }
              : p
          )
        )

        toast({
          title: "Başarılı",
          description: "Ürün güncellendi",
        })

        cancelInlineEdit()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "Güncelleme başarısız",
      })
      cancelInlineEdit()
    }
  }

  const handleInlineKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveInlineEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelInlineEdit()
    }
  }

  // Open Edit Sheet
  const openEditSheet = (product) => {
    setEditingProduct(product)
    setEditSheetOpen(true)
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Handle both populated (object) and non-populated (string) category
    const categoryName = typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : product.category

    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || categoryName === categoryFilter

    let matchesStock = true
    if (stockFilter === "in-stock") {
      matchesStock = product.stock > 0
    } else if (stockFilter === "out-of-stock") {
      matchesStock = product.stock === 0
    } else if (stockFilter === "low-stock") {
      matchesStock = product.stock > 0 && product.stock <= 10
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

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
                  <BreadcrumbPage>Ürün Listesi</BreadcrumbPage>
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
                <Package className="h-8 w-8" />
                Ürünler
              </h1>
              <p className="text-muted-foreground mt-1">
                Tüm ürünleri görüntüleyin ve yönetin
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProducts()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Yenile
              </Button>
              <Button asChild size="sm">
                <Link to="/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ürün
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ürün adı veya kategori ile ara..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Stok Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ürünler</SelectItem>
                <SelectItem value="in-stock">Stokta</SelectItem>
                <SelectItem value="low-stock">Düşük Stok</SelectItem>
                <SelectItem value="out-of-stock">Tükendi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} ürün bulundu
            {(searchQuery || categoryFilter !== "all" || stockFilter !== "all") &&
              ` (${products.length} toplam)`}
          </p>

          {/* Table */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Ürün bulunamadı</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Filtrelerinizi değiştirerek tekrar deneyin veya yeni ürün ekleyin
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Görsel</TableHead>
                      <TableHead>Ürün Adı</TableHead>
                      <TableHead className="font-mono text-xs">SKU</TableHead>
                      <TableHead className="font-mono text-xs">Ürün ID</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          {product.image?.[0] ? (
                            <img
                              src={getImageUrl(product.image[0])}
                              alt={product.name}
                              className="h-12 w-12 rounded object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = '/placeholder-product.png'
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {product.name}
                              {product.bestseller && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Çok Satan
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary select-all">
                              {product.sku || '-'}
                            </span>
                            {product.sku && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(product.sku)}
                                title="SKU'yu kopyala"
                              >
                                {copiedId === product.sku ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground select-all">
                              {product._id}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(product._id)}
                              title="ID'yi kopyala"
                            >
                              {copiedId === product._id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell
                          onDoubleClick={() => startInlineEdit(product._id, "category", typeof product.category === 'object' ? product.category._id : product.category)}
                          className="cursor-pointer hover:bg-muted/50"
                          title="Çift tıkla düzenle"
                        >
                          {inlineEdit.productId === product._id && inlineEdit.field === "category" ? (
                            <Select
                              value={inlineEdit.value}
                              onValueChange={(val) => setInlineEdit({ ...inlineEdit, value: val })}
                              onOpenChange={(open) => {
                                if (!open) saveInlineEdit()
                              }}
                            >
                              <SelectTrigger className="h-8 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            typeof product.category === 'object' ? product.category.name : product.category
                          )}
                        </TableCell>
                        <TableCell
                          onDoubleClick={() => startInlineEdit(product._id, "basePrice", product.basePrice)}
                          className="font-medium cursor-pointer hover:bg-muted/50"
                          title="Çift tıkla düzenle"
                        >
                          {inlineEdit.productId === product._id && inlineEdit.field === "basePrice" ? (
                            <Input
                              type="number"
                              step="0.01"
                              className="h-8 w-24"
                              value={inlineEdit.value}
                              onChange={(e) => setInlineEdit({ ...inlineEdit, value: parseFloat(e.target.value) })}
                              onKeyDown={handleInlineKeyDown}
                              onBlur={saveInlineEdit}
                              autoFocus
                            />
                          ) : (
                            formatCurrency(product.basePrice)
                          )}
                        </TableCell>
                        <TableCell
                          onDoubleClick={() => startInlineEdit(product._id, "stock", product.stock)}
                          className="cursor-pointer hover:bg-muted/50"
                          title="Çift tıkla düzenle"
                        >
                          {inlineEdit.productId === product._id && inlineEdit.field === "stock" ? (
                            <Input
                              type="number"
                              className="h-8 w-20"
                              value={inlineEdit.value}
                              onChange={(e) => setInlineEdit({ ...inlineEdit, value: parseInt(e.target.value) })}
                              onKeyDown={handleInlineKeyDown}
                              onBlur={saveInlineEdit}
                              autoFocus
                            />
                          ) : (
                            <Badge
                              variant={
                                product.stock === 0
                                  ? "destructive"
                                  : product.stock <= 10
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {product.stock || 0}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50">
                            {product.freshType === "taze" ? "Taze" : "Kuru"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditSheet(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Sayfa {currentPage} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete?.name} ürünü kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Simple Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Basit Düzenle</DialogTitle>
            <DialogDescription>
              Temel ürün bilgilerini hızlıca güncelleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Ürün Adı</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="basePrice">Fiyat (₺)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.basePrice}
                  onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="bestseller"
                checked={editForm.bestseller}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, bestseller: checked })
                }
              />
              <Label htmlFor="bestseller" className="cursor-pointer">
                Çok Satan Ürün
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setEditingProduct(null)
              }}
            >
              İptal
            </Button>
            <Button onClick={handleQuickEdit}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet */}
      <ProductEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        product={editingProduct}
        onSuccess={() => fetchProducts(true)}
      />
    </SidebarProvider>
  )
}

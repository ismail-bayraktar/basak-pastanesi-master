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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  DollarSign,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { backendUrl } from "@/App"

export default function Customers() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // Customer details modal
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerDetails, setCustomerDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [pagination.page, searchQuery])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get(`${backendUrl}/api/user/customers`, {
        headers: { token },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
        },
      })

      if (response.data.success) {
        setCustomers(response.data.customers)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Hata",
        description: "Müşteriler yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerDetails = async (customerId) => {
    try {
      setDetailsLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${backendUrl}/api/user/customers/${customerId}`,
        { headers: { token } }
      )

      if (response.data.success) {
        setCustomerDetails(response.data)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error("Error fetching customer details:", error)
      toast({
        title: "Hata",
        description: "Müşteri detayları yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    fetchCustomerDetails(customer._id)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate statistics
  const stats = {
    totalCustomers: pagination.total,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
    averageOrderValue:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) /
          customers.reduce((sum, c) => sum + c.totalOrders, 0)
        : 0,
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
                    <BreadcrumbPage>Müşteriler</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Badge variant="outline" className="text-sm">
              {pagination.total} Müşteri
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
              <p className="text-muted-foreground">
                Kayıtlı müşterileri ve sipariş geçmişlerini görüntüleyin
              </p>
            </div>
            <Button onClick={fetchCustomers} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ort. Sipariş Değeri</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageOrderValue || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Müşteri Listesi</CardTitle>
                  <CardDescription>Tüm kayıtlı müşteriler ve sipariş istatistikleri</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="İsim veya email ile ara..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setPagination({ ...pagination, page: 1 })
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Müşteri bulunamadı</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "Arama kriterlerinize uygun müşteri bulunamadı"
                      : "Henüz kayıtlı müşteri yok"}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>İletişim</TableHead>
                        <TableHead>Kayıt Tarihi</TableHead>
                        <TableHead className="text-center">Siparişler</TableHead>
                        <TableHead className="text-right">Toplam Harcama</TableHead>
                        <TableHead className="text-center">Son Sipariş</TableHead>
                        <TableHead className="text-center">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(customer.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{customer.totalOrders}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {customer.lastOrder ? formatDate(customer.lastOrder) : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              onClick={() => handleViewCustomer(customer)}
                              variant="ghost"
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setPagination({
                                  ...pagination,
                                  page: Math.max(1, pagination.page - 1),
                                })
                              }
                              disabled={pagination.page === 1}
                            />
                          </PaginationItem>
                          {[...Array(pagination.pages)].map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setPagination({ ...pagination, page: i + 1 })}
                                isActive={pagination.page === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setPagination({
                                  ...pagination,
                                  page: Math.min(pagination.pages, pagination.page + 1),
                                })
                              }
                              disabled={pagination.page === pagination.pages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Customer Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Müşteri Detayları</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name} - Sipariş geçmişi ve istatistikler
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : customerDetails ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">İletişim Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{customerDetails.customer.email}</span>
                    </div>
                    {customerDetails.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customerDetails.customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Kayıt: {formatDate(customerDetails.customer.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sipariş İstatistikleri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Toplam Sipariş</span>
                      <Badge>{customerDetails.stats.totalOrders}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Toplam Harcama</span>
                      <span className="font-medium">
                        {formatCurrency(customerDetails.stats.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ortalama Sipariş</span>
                      <span className="font-medium">
                        {formatCurrency(customerDetails.stats.averageOrderValue)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sipariş Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerDetails.orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Henüz sipariş bulunmuyor
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customerDetails.orders.slice(0, 10).map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between border-b pb-3"
                        >
                          <div>
                            <p className="text-sm font-medium">Sipariş #{order._id.slice(-6)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.date)} - {order.items.length} ürün
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatCurrency(order.amount)}</p>
                            <Badge variant={order.payment ? "default" : "secondary"} className="text-xs">
                              {order.payment ? "Ödendi" : "Beklemede"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

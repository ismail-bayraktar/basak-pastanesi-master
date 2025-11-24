# Admin Dashboard - Sheet Pattern Standardı

Bu doküman, Tulumbak Admin Dashboard'da ekleme ve düzenleme işlemleri için standart Sheet (Offcanvas) pattern'ini tanımlar.

## Genel Bakış

Admin panelimizde **Dialog** bileşenleri yerine **Sheet** (sağdan açılan offcanvas) bileşenlerini kullanıyoruz. Bu yaklaşım:
- ✅ Daha fazla form alanı için alan sağlar
- ✅ Tutarlı kullanıcı deneyimi sunar
- ✅ Mobil uyumludur
- ✅ Modern ve profesyonel görünüm sağlar

## Sheet Pattern Kullanım Alanları

Sheet pattern'i aşağıdaki durumlarda kullanın:
- ✅ Yeni kayıt ekleme (Add) işlemleri
- ✅ Mevcut kayıt düzenleme (Edit) işlemleri
- ✅ Çok alanlı formlar (>5 input)
- ✅ Görsel yükleme içeren formlar
- ✅ SEO alanları olan formlar

Dialog pattern'i sadece şu durumlarda kullanın:
- ⚠️ Onay mesajları (AlertDialog)
- ⚠️ Silme işlemleri (AlertDialog)
- ⚠️ Basit uyarılar

## Dosya Yapısı

Her kaynak türü için iki Sheet component oluşturun:

```
admin/src/components/
├── CategoryAddSheet.jsx      # Yeni kategori ekleme
├── CategoryEditSheet.jsx     # Kategori düzenleme
├── ProductAddSheet.jsx       # Yeni ürün ekleme (örnek)
├── ProductEditSheet.jsx      # Ürün düzenleme
└── ...
```

## Add Sheet Template

```jsx
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { backendUrl } from "@/lib/api"
import { Save, Loader2, Image as ImageIcon, X } from "lucide-react"

export default function ResourceAddSheet({ open, onOpenChange, onSuccess }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    // Diğer alanlar...
  })

  // Görsel yönetimi
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Form reset when sheet closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        active: true,
      })
      setImageFile(null)
      setImagePreview(null)
      setLoading(false)
    }
  }, [open])

  // Görsel seçimi
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Görsel silme
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasyon
    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "İsim zorunludur",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const submitFormData = new FormData()

      // Text alanları ekle
      submitFormData.append('name', formData.name)
      submitFormData.append('description', formData.description)
      submitFormData.append('active', formData.active)

      // Görsel varsa ekle
      if (imageFile) {
        submitFormData.append('image', imageFile)
      }

      const response = await fetch(`${backendUrl}/api/resource/add`, {
        method: 'POST',
        body: submitFormData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kayıt eklendi",
        })
        onSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(data.message || 'Kayıt eklenemedi')
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Yeni Kayıt Ekle</SheetTitle>
            <SheetDescription>
              Bilgileri girin ve kaydedin
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  İsim <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="İsim..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Açıklama..."
                  rows={3}
                />
              </div>

              {/* Aktif/Pasif Toggle */}
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>

            {/* Görsel Yükleme */}
            <div className="space-y-4">
              <Label>Görsel</Label>

              {imagePreview && (
                <div className="relative border rounded-lg p-2">
                  <img
                    src={imagePreview}
                    alt="Önizleme"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!imagePreview && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="p-3 bg-muted rounded-full">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Görsel Yükle</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG (max. 2MB)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Ekle
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
```

## Edit Sheet Template

Edit Sheet, Add Sheet ile aynı yapıdadır, sadece şu farklar vardır:

```jsx
export default function ResourceEditSheet({ open, onOpenChange, resource, onSuccess }) {
  // ...

  // Mevcut veriyi yükle
  useEffect(() => {
    if (resource && open) {
      setFormData({
        name: resource.name || "",
        description: resource.description || "",
        active: resource.active !== undefined ? resource.active : true,
      })
      setExistingImage(resource.image || null)
      setNewImageFile(null)
      setNewImagePreview(null)
    }
  }, [resource, open])

  // Form submit - UPDATE endpoint
  const response = await fetch(`${backendUrl}/api/resource/update/${resource._id}`, {
    method: 'POST',
    body: submitFormData,
  })

  // SheetHeader
  <SheetTitle>Kayıt Düzenle</SheetTitle>

  // Button text
  Güncelleniyor... / Güncelle
}
```

## Sayfa Entegrasyonu

```jsx
import ResourceAddSheet from "@/components/ResourceAddSheet"
import ResourceEditSheet from "@/components/ResourceEditSheet"

export default function ResourcesPage() {
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setEditSheetOpen(true)
  }

  return (
    <>
      {/* Yeni Ekle Butonu */}
      <Button onClick={() => setAddSheetOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Yeni Ekle
      </Button>

      {/* Düzenle Butonu (Tabloda) */}
      <Button onClick={() => handleEdit(resource)}>
        <Edit className="h-4 w-4" />
      </Button>

      {/* Sheet Components */}
      <ResourceAddSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onSuccess={refresh}
      />

      <ResourceEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        resource={editingResource}
        onSuccess={refresh}
      />
    </>
  )
}
```

## Stil Kuralları

### SheetContent Class
```jsx
<SheetContent className="w-full sm:max-w-lg overflow-y-auto">
```
- `w-full`: Mobilde tam genişlik
- `sm:max-w-lg`: Desktop'ta maksimum 512px
- `overflow-y-auto`: Uzun içerik için kaydırma

### Form Layout
```jsx
<div className="space-y-6 py-6">
  {/* Bölümler space-y-4 ile ayrılır */}
  <div className="space-y-4">
    {/* Her input space-y-2 ile etiketinden ayrılır */}
    <div className="grid gap-2">
      <Label>...</Label>
      <Input>...</Input>
    </div>
  </div>
</div>
```

### Switch Toggle Pattern
```jsx
<div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
  <Switch id="active" checked={formData.active} onCheckedChange={...} />
  <Label htmlFor="active" className="cursor-pointer">Aktif</Label>
</div>
```

### Görsel Upload Pattern
```jsx
{/* Önizleme varsa göster */}
{imagePreview && (
  <div className="relative border rounded-lg p-2">
    <img src={imagePreview} className="w-full h-48 object-cover rounded" />
    <Button variant="destructive" size="icon" className="absolute top-3 right-3">
      <X className="h-4 w-4" />
    </Button>
  </div>
)}

{/* Önizleme yoksa upload alanı */}
{!imagePreview && (
  <div className="border-2 border-dashed rounded-lg p-6 text-center">
    <input type="file" className="hidden" id="..." />
    <label htmlFor="..." className="cursor-pointer flex flex-col items-center gap-2">
      <ImageIcon />
      <p>Görsel Yükle</p>
    </label>
  </div>
)}
```

## SEO Alanları Pattern

```jsx
<div className="space-y-4">
  <h3 className="font-medium text-sm">SEO Bilgileri</h3>

  <div className="grid gap-2">
    <Label htmlFor="metaTitle">Meta Başlık</Label>
    <Input
      id="metaTitle"
      value={formData.metaTitle}
      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
      maxLength={60}
    />
    <p className="text-xs text-muted-foreground">
      {formData.metaTitle.length}/60 karakter
    </p>
  </div>

  <div className="grid gap-2">
    <Label htmlFor="metaDescription">Meta Açıklama</Label>
    <Textarea
      id="metaDescription"
      value={formData.metaDescription}
      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
      maxLength={160}
      rows={2}
    />
    <p className="text-xs text-muted-foreground">
      {formData.metaDescription.length}/160 karakter
    </p>
  </div>

  <div className="grid gap-2">
    <Label htmlFor="keywords">Anahtar Kelimeler</Label>
    <Input
      id="keywords"
      value={formData.keywords}
      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
      placeholder="kelime1, kelime2, kelime3"
    />
    <p className="text-xs text-muted-foreground">
      Virgülle ayırarak girin
    </p>
  </div>
</div>
```

## Validasyon Pattern

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()

  // 1. Zorunlu alan kontrolü
  if (!formData.name.trim()) {
    toast({
      title: "Hata",
      description: "İsim zorunludur",
      variant: "destructive",
    })
    return
  }

  // 2. Minimum karakter kontrolü
  if (formData.name.trim().length < 2) {
    toast({
      title: "Hata",
      description: "İsim en az 2 karakter olmalıdır",
      variant: "destructive",
    })
    return
  }

  // 3. Email format kontrolü (gerekirse)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.email && !emailRegex.test(formData.email)) {
    toast({
      title: "Hata",
      description: "Geçerli bir email adresi girin",
      variant: "destructive",
    })
    return
  }

  // Submit işlemi...
}
```

## State Yönetimi Best Practices

1. **Form State**: Tek bir `formData` object kullanın
2. **Loading State**: Submit sırasında button disable edin
3. **Image States**: Ayrı state'ler kullanın (file, preview)
4. **Reset Pattern**: Sheet kapandığında form'u temizleyin

```jsx
// ✅ DOĞRU
const [formData, setFormData] = useState({
  name: "",
  description: "",
  active: true,
})

// ❌ YANLIŞ
const [name, setName] = useState("")
const [description, setDescription] = useState("")
const [active, setActive] = useState(true)
```

## API Entegrasyonu

```jsx
// FormData oluştur (multipart/form-data)
const submitFormData = new FormData()

// Text alanları ekle
submitFormData.append('name', formData.name)
submitFormData.append('description', formData.description)
submitFormData.append('active', formData.active)

// Görsel varsa ekle
if (imageFile) {
  submitFormData.append('image', imageFile)
}

// POST request
const response = await fetch(`${backendUrl}/api/resource/add`, {
  method: 'POST',
  body: submitFormData, // JSON.stringify KULLANMA!
})
```

## Mevcut Implementasyonlar

### Kategoriler
- `admin/src/components/CategoryAddSheet.jsx`
- `admin/src/components/CategoryEditSheet.jsx`
- `admin/src/pages/products/Categories.jsx`

### Ürünler
- `admin/src/components/ProductEditSheet.jsx`
- `admin/src/components/ProductFullEditDialog.jsx` (Karmaşık form için)
- `admin/src/pages/products/ProductList.jsx`

## Checklist

Yeni bir Sheet component oluştururken:

- [ ] `Sheet`, `SheetContent`, `SheetHeader`, `SheetFooter` import edildi
- [ ] `w-full sm:max-w-lg overflow-y-auto` class'ı eklendi
- [ ] Form `onSubmit` handler'ı eklendi
- [ ] Validasyon implement edildi
- [ ] Loading state eklendi
- [ ] Toast mesajları eklendi
- [ ] Image upload varsa preview/remove fonksiyonları eklendi
- [ ] Form reset `useEffect` eklendi
- [ ] `onSuccess` callback çağrılıyor
- [ ] SEO alanları varsa karakter limitleri gösteriliyor
- [ ] Button'lar loading durumunda disable ediliyor
- [ ] FormData doğru şekilde oluşturuluyor

## Örnek Kullanım Senaryoları

### Senaryo 1: Yeni Kategori Ekleme
1. Kullanıcı "Yeni Kategori" butonuna tıklar
2. CategoryAddSheet sağdan açılır
3. Kullanıcı form doldurur (isim, açıklama, görsel)
4. "Ekle" butonuna tıklar
5. Validasyon geçerse API'ye gönderilir
6. Başarılı olursa toast gösterilir, Sheet kapanır, liste güncellenir

### Senaryo 2: Kategori Düzenleme
1. Kullanıcı tabloda "Düzenle" ikonuna tıklar
2. CategoryEditSheet sağdan açılır
3. Mevcut veriler form'a yüklenir
4. Kullanıcı değişiklik yapar
5. "Güncelle" butonuna tıklar
6. API'ye gönderilir, başarılı olursa Sheet kapanır

## Sorun Giderme

### Sheet açılmıyor
- `open` prop'u doğru state'e bağlı mı kontrol edin
- `onOpenChange` callback doğru state setter'a bağlı mı kontrol edin

### Form submit olmuyor
- `e.preventDefault()` var mı kontrol edin
- Console'da API error var mı kontrol edin
- FormData doğru oluşturulmuş mu kontrol edin

### Görsel yüklenmiyor
- `accept="image/*"` attribute'u var mı kontrol edin
- FileReader doğru çalışıyor mu kontrol edin
- API multipart/form-data kabul ediyor mu kontrol edin

## Gelecek Geliştirmeler

- [ ] Drag & drop görsel yükleme
- [ ] Çoklu görsel yükleme desteği
- [ ] Form dirty state kontrolü (kapatırken uyarı)
- [ ] Otomatik kaydetme (draft)
- [ ] Klavye kısayolları (ESC, Ctrl+S)
- [ ] Form state persist (localStorage)

---

**Son Güncelleme**: 2025
**Geliştirici**: Tulumbak Development Team

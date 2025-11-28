# Debug Adımları - Beyaz Ekran Sorunu

## Yapılan Düzeltmeler

1. ✅ **Error Boundary Eklendi** - Hataları yakalamak için
2. ✅ **Console Log'ları Eklendi** - Debug için
3. ✅ **FeaturedProducts Component Düzeltildi** - Type safety iyileştirildi
4. ✅ **Kullanılmayan Import Kaldırıldı** - useEffect import'u temizlendi

## Şimdi Yapmanız Gerekenler

### 1. Dev Server'ı Yeniden Başlatın
```bash
cd apps/web
# Eğer çalışıyorsa durdurun (Ctrl+C)
pnpm dev
```

### 2. Browser'da Kontrol Edin
1. `http://localhost:3000` açın
2. **F12** ile Developer Tools'u açın
3. **Console** tab'ına bakın

### 3. Console'da Görmeniz Gerekenler

**Başarılı durumda:**
```
🚀 Starting app...
✅ Root element found: <div id="root">
✅ App rendered
🎨 Rendering App, view: home
```

**Hata durumunda:**
- Kırmızı hata mesajları görünecek
- ErrorBoundary hata sayfası gösterilecek

### 4. Network Tab'ını Kontrol Edin
1. **Network** tab'ına geçin
2. **Refresh** yapın (F5)
3. Şu dosyaların yüklendiğini kontrol edin:
   - `index.html` ✅
   - `index-[hash].js` ✅
   - `index-[hash].css` ✅

### 5. Eğer Hala Beyaz Ekran

**A) Console'da Hata Var mı?**
- Varsa, hata mesajını paylaşın
- ErrorBoundary sayfası görünüyorsa, hata detaylarını paylaşın

**B) Network Tab'ında Dosyalar Yükleniyor mu?**
- Eğer dosyalar yüklenmiyorsa, Vite server'ı çalışmıyor olabilir
- Terminal'deki hata mesajlarını kontrol edin

**C) CSS Yükleniyor mu?**
- Elements tab'ında `<body>` elementine bakın
- `bg-basak-cream` class'ı uygulanmış mı kontrol edin

## Olası Sorunlar ve Çözümleri

### Sorun 1: "Cannot find module '@/...'"
**Çözüm:** Path alias çalışmıyor
```bash
# Vite cache'i temizle
rm -rf node_modules/.vite
pnpm dev
```

### Sorun 2: "Uncaught SyntaxError"
**Çözüm:** Syntax hatası var
- Console'daki hata satır numarasını kontrol edin
- İlgili dosyayı açıp kontrol edin

### Sorun 3: "Failed to load module script"
**Çözüm:** Module type sorunu
- `index.html` dosyasında script tag'i kontrol edin
- Vite otomatik olarak ekler, manuel eklemeyin

### Sorun 4: CSS Yüklenmiyor
**Çözüm:** PostCSS/Tailwind sorunu
```bash
# Dependencies yeniden yükle
rm -rf node_modules
pnpm install
pnpm dev
```

## Hızlı Test

Eğer hala çalışmıyorsa, `index.tsx` dosyasını geçici olarak şununla değiştirin:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

const Test = () => <div style={{padding: '50px'}}><h1>✅ React Çalışıyor!</h1></div>;

ReactDOM.createRoot(document.getElementById('root')!).render(<Test />);
```

Eğer bu çalışıyorsa, sorun App.tsx veya component'lerde.


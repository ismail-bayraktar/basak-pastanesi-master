// Category reference from backend
export interface ProductCategory {
  _id: string;
  name: string;
  active: boolean;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;  // TL cinsinden base fiyat
  image: string[];    // Görsel URL'leri
  category: ProductCategory;   // Kategori objesi (populated from backend)
  subCategory?: string;

  // Gramaj ve Ağırlıklar (opsiyonel - varyasyon kaldırıldı)
  sizes?: number[];
  weights?: number[];
  sizePrices?: Array<{ size: number; price: number }>;

  // Kişi Sayısı (opsiyonel)
  personCounts?: string[];

  // Ürün Özellikleri
  freshType: 'taze' | 'kuru';              // Taze veya kuru
  packaging: 'standart' | 'özel';          // Paketleme tipi
  giftWrap: boolean;                        // Hediye paketi var mı?
  labels: string[];                         // Etiketler: ["Yeni", "Popüler", "İndirimde"]
  bestseller: boolean;                      // Çok satan mı?
  stock: number;                            // Stok miktarı

  // Ürün Bilgileri
  allergens?: string;        // Alerjen bilgileri
  ingredients?: string;      // İçindekiler/Malzemeler
  shelfLife?: string;        // Raf ömrü (örn: "3 gün", "1 hafta")
  storageInfo?: string;      // Saklama koşulları

  // Meta
  date: number;              // Unix timestamp
}

export interface ProductListResponse {
  success: boolean;
  products?: Product[];
  total?: number;
  message?: string;
}

export interface ProductDetailResponse {
  success: boolean;
  data?: Product;
  message?: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: string;
  showSearch: boolean;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setShowSearch: (show: boolean) => void;
  fetchProducts: () => Promise<void>;
}

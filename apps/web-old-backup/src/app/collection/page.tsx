'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/v2/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Product } from '@/types/product';

function CollectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, fetchProducts, loading, error } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  // State
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // URL Params Sync
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  // Filtering Logic
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category.slug === selectedCategory);
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Price Filter
    result = result.filter((p) => {
      const price = p.basePrice; // Assuming basePrice is in TL directly based on previous context
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default: // newest
        // Assuming _id or createdAt can be used for "newest" if available, otherwise keep default order
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, priceRange, sortOption]);

  // Handlers
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    // Update URL without full reload
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`/collection?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 2000]);
    setSearchQuery('');
    setSortOption('newest');
    router.push('/collection');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-basak-golden"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Hata: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Hero Section - Minimal & Typography Focused */}
      <div className="bg-white border-b border-neutral-100 pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-[1400px]">
          <h1 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tight mb-4">
            Tüm Lezzetler
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl">
            Geleneksel tarifler, günlük üretim ve en taze malzemelerle hazırlanan
            eşsiz baklava koleksiyonumuz.
          </p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 shadow-sm">
        <div className="container mx-auto max-w-[1400px] px-4 h-16 flex items-center justify-between gap-4">

          {/* Horizontal Categories (Desktop) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
            >
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.slug
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Mobile Category & Filter Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Sort Dropdown */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[140px] h-9 text-sm bg-transparent border-neutral-200">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeniler</SelectItem>
                <SelectItem value="price-asc">Fiyat (Artan)</SelectItem>
                <SelectItem value="price-desc">Fiyat (Azalan)</SelectItem>
                <SelectItem value="name-asc">İsim (A-Z)</SelectItem>
                <SelectItem value="name-desc">İsim (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Drawer (Mobile & Advanced) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filtrele</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filtrele</SheetTitle>
                  <SheetDescription>
                    Ürünleri özelliklerine göre filtreleyin.
                  </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-8">
                  {/* Mobile Categories inside Drawer */}
                  <div className="space-y-4 md:hidden">
                    <h3 className="font-medium text-sm text-neutral-900">Kategoriler</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedCategory === 'all'
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-600 border-neutral-200'
                          }`}
                      >
                        Tümü
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedCategory === cat.slug
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-600 border-neutral-200'
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-neutral-900">Fiyat Aralığı</h3>
                      <span className="text-xs text-neutral-500">
                        {priceRange[0]}₺ - {priceRange[1]}₺
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, 2000]}
                      max={2000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearFilters}
                    >
                      Temizle
                    </Button>
                    <SheetTrigger asChild>
                      <Button className="flex-1 bg-basak-golden hover:bg-basak-golden/90 text-white">
                        Uygula
                      </Button>
                    </SheetTrigger>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Sonuç Bulunamadı</h3>
            <p className="text-neutral-500 mt-2 mb-6 max-w-sm">
              Arama kriterlerinize uygun ürün bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-basak-golden"></div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
}

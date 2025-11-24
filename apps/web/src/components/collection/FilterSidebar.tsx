'use client';

import { useState, useEffect } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface FilterState {
  categoryId: string | null;
  sizes: number[];
  priceRange: [number, number];
  personCounts: string[];
  freshType: 'all' | 'taze' | 'kuru';
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void; // Mobile için
  isMobile?: boolean;
}

export function FilterSidebar({ filters, onFilterChange, onClose, isMobile = false }: FilterSidebarProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 5000 });

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Fetch price range from backend
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; minPrice: number; maxPrice: number }>(
          API_ENDPOINTS.PRODUCTS.PRICE_RANGE
        );
        if (response.data.success) {
          setPriceRange({
            min: response.data.minPrice,
            max: response.data.maxPrice
          });
        }
      } catch (error) {
        console.error('Error fetching price range:', error);
      }
    };
    fetchPriceRange();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      ...filters,
      categoryId: categoryId === filters.categoryId ? null : categoryId
    });
  };

  const handleSizeToggle = (size: number) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handlePersonCountToggle = (count: string) => {
    const newCounts = filters.personCounts.includes(count)
      ? filters.personCounts.filter(c => c !== count)
      : [...filters.personCounts, count];
    onFilterChange({ ...filters, personCounts: newCounts });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleReset = () => {
    onFilterChange({
      categoryId: null,
      sizes: [],
      priceRange: [priceRange.min, priceRange.max],
      personCounts: [],
      freshType: 'all',
      inStockOnly: false
    });
  };

  const hasActiveFilters =
    filters.categoryId !== null ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > priceRange.min ||
    filters.priceRange[1] < priceRange.max ||
    filters.personCounts.length > 0 ||
    filters.freshType !== 'all' ||
    filters.inStockOnly;

  // Gramaj seçenekleri
  const sizeOptions = [250, 500, 1000, 2000];

  // Kişi sayısı seçenekleri
  const personCountOptions = ['2-3', '5-6', '8-10', '12+'];

  return (
    <div className={`${isMobile ? 'h-full' : 'sticky top-4'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Filtrele</h2>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion type="multiple" defaultValue={['category', 'size', 'price']} className="w-full">
          {/* Kategori Filtresi */}
          <AccordionItem value="category">
            <AccordionTrigger>Kategori</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category._id}`}
                      checked={filters.categoryId === category._id}
                      onCheckedChange={() => handleCategoryChange(category._id)}
                    />
                    <Label
                      htmlFor={`cat-${category._id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                      {category.productCount !== undefined && (
                        <span className="text-xs text-neutral-500">({category.productCount})</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Gramaj Filtresi */}
          <AccordionItem value="size">
            <AccordionTrigger>Gramaj</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {sizeOptions.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={filters.sizes.includes(size)}
                      onCheckedChange={() => handleSizeToggle(size)}
                    />
                    <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer">
                      {size}g
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fiyat Aralığı */}
          <AccordionItem value="price">
            <AccordionTrigger>Fiyat</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider
                  min={priceRange.min}
                  max={priceRange.max}
                  step={50}
                  value={filters.priceRange}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>{filters.priceRange[0]} ₺</span>
                  <span>{filters.priceRange[1]} ₺</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Kişi Sayısı */}
          <AccordionItem value="person">
            <AccordionTrigger>Kişi Sayısı</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {personCountOptions.map((count) => (
                  <div key={count} className="flex items-center space-x-2">
                    <Checkbox
                      id={`person-${count}`}
                      checked={filters.personCounts.includes(count)}
                      onCheckedChange={() => handlePersonCountToggle(count)}
                    />
                    <Label htmlFor={`person-${count}`} className="text-sm font-normal cursor-pointer">
                      {count} kişilik
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Taze/Kuru */}
          <AccordionItem value="freshType">
            <AccordionTrigger>Ürün Tipi</AccordionTrigger>
            <AccordionContent>
              <RadioGroup value={filters.freshType} onValueChange={(value: any) => onFilterChange({ ...filters, freshType: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="fresh-all" />
                  <Label htmlFor="fresh-all" className="text-sm font-normal cursor-pointer">
                    Tümü
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="taze" id="fresh-taze" />
                  <Label htmlFor="fresh-taze" className="text-sm font-normal cursor-pointer">
                    Taze
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kuru" id="fresh-kuru" />
                  <Label htmlFor="fresh-kuru" className="text-sm font-normal cursor-pointer">
                    Kuru
                  </Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>

          {/* Stok Durumu */}
          <AccordionItem value="stock">
            <AccordionTrigger>Stok Durumu</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStockOnly}
                  onCheckedChange={(checked) => onFilterChange({ ...filters, inStockOnly: !!checked })}
                />
                <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                  Sadece stokta olanlar
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer - Reset Button */}
      {hasActiveFilters && (
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleReset}>
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
}

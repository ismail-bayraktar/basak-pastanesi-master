'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Search, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useProductStore } from '@/stores/productStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MiniCart } from '@/components/cart/MiniCart';

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCartCount } = useCartStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { search, setSearch, setShowSearch } = useProductStore();
  const router = useRouter();

  const cartCount = getCartCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearch(true);
      setSearchOpen(false);
      router.push(`/collection?search=${encodeURIComponent(search)}`);
    }
  };

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/50 shadow-sm">
      <div className="w-full max-w-[1400px] mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/assets/logo.png"
            alt="Basak Pastanesi İzmir Baklava"
            width={140}
            height={46}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-neutral-800 hover:text-basak-golden transition-colors font-medium"
          >
            Ana Sayfa
          </Link>

          {/* Ürünler Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-neutral-800 hover:text-basak-golden transition-colors font-medium">
                Ürünler
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/collection" className="w-full cursor-pointer">
                  Tüm Ürünler
                </Link>
              </DropdownMenuItem>
              {categories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuItem key={category._id} asChild>
                      <Link
                        href={`/collection?category=${category.slug}`}
                        className="w-full cursor-pointer"
                      >
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/about"
            className="text-neutral-800 hover:text-basak-golden transition-colors font-medium"
          >
            Hakkımızda
          </Link>

          <Link
            href="/contact"
            className="text-neutral-800 hover:text-basak-golden transition-colors font-medium"
          >
            İletişim
          </Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-basak-golden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:text-basak-golden"
            onClick={() => useCartStore.getState().setMiniCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-basak-golden text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:text-basak-golden">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">
                      Profilim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="w-full cursor-pointer">
                      Siparişlerim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-red-600"
                  >
                    Çıkış Yap
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full cursor-pointer">
                      Giriş Yap
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="w-full cursor-pointer">
                      Kayıt Ol
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-neutral-200 p-4 shadow-lg animate-in slide-in-from-top-5">
          <div className="max-w-[800px] mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="flex-1 h-12 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:border-basak-golden focus:ring-1 focus:ring-basak-golden"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
              autoFocus
            />
            <Button onClick={handleSearch} className="h-12 px-8 bg-basak-golden hover:bg-basak-golden/90 text-white">
              Ara
            </Button>
          </div>
        </div>
      )}

      <MiniCart />
    </nav>
  );
}

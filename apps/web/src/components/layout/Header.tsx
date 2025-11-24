'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MiniCart } from '@/components/cart/MiniCart';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCartCount } = useCartStore();
  const { search, setSearch, setShowSearch, showSearch } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const cartCount = getCartCount();

  // Kategorileri yükle
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearch(true);
      window.location.href = `/collection?search=${encodeURIComponent(search)}`;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
      {/* Top Bar - Kaldırıldı, şeffaf header için */}

      {/* Main Header */}
      <div className="w-[85%] mx-auto px-4 h-[90px]">
        <div className="flex items-center justify-between h-full">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/tulumbak-logo.png"
              alt="Tulumbak İzmir Baklava"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-neutral-800">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Ana Sayfa
            </Link>

            {/* Ürünler - Kategori Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
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
                          {category.icon && <span className="mr-2">{category.icon}</span>}
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about" className="hover:text-brand-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="hover:text-brand-primary transition-colors">
              İletişim
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4 text-neutral-800">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:text-brand-primary transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-brand-primary transition-colors" aria-label="User menu">
                    <User size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Siparişlerim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profilim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                  <User size={20} />
                  <span className="hidden md:inline text-sm">Giriş Yap</span>
                </Link>
                <span className="hidden md:inline text-neutral-300">|</span>
                <Link href="/register" className="hidden md:inline text-sm hover:text-brand-primary transition-colors">
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Cart */}
            <button
              onClick={() => useCartStore.getState().setMiniCartOpen(true)}
              className="relative hover:text-brand-primary transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <Input
              type="text"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Ara</Button>
          </form>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white/95 backdrop-blur-sm">
          <nav className="w-[85%] mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>

            {/* Ürünler - Kategoriler */}
            <div>
              <Link
                href="/collection"
                className="hover:text-neutral-600 transition-colors font-medium block mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tüm Ürünler
              </Link>
              {categories.length > 0 && (
                <div className="pl-4 flex flex-col gap-2 border-l-2 border-neutral-200">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/collection?category=${category.slug}`}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hakkımızda
            </Link>
            <Link
              href="/contact"
              className="hover:text-neutral-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              İletişim
            </Link>
            {!isAuthenticated && (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="hover:text-neutral-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="hover:text-neutral-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <>
                <Link
                  href="/orders"
                  className="hover:text-neutral-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Siparişlerim
                </Link>
                <Link
                  href="/profile"
                  className="hover:text-neutral-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profilim
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left hover:text-neutral-600 transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      <MiniCart />
    </header>
  );
}

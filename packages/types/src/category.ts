// Category interface matching backend CategoryModel
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
  order: number;
  productCount?: number;  // Backend'den includeProductCount=true ile geliyor
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface CategoryListResponse {
  success: boolean;
  categories: Category[];
  message?: string;
}

export interface CategoryDetailResponse {
  success: boolean;
  category?: Category;
  message?: string;
}

// Category Store State
export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;

  // Actions
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  fetchCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
}

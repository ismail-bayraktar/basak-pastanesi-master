import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { categoryService, Category } from '@/services/categoryService';

// Local image mapping based on category keywords
const getCategoryImage = (categoryName: string): string => {
  const lowerTitle = categoryName.toLowerCase();
  if (lowerTitle.includes('izmir bomba')) return '/images/categories/izmir-bomba.png';
  if (lowerTitle.includes('tatlı') && (lowerTitle.includes('adet') || lowerTitle.includes('dilim'))) return '/images/categories/tatli.png';
  if (lowerTitle.includes('waffle')) return '/images/categories/waffle.png';
  if (lowerTitle.includes('pasta')) return '/images/categories/cakes.png';
  if (lowerTitle.includes('kahvaltı') || lowerTitle.includes('sandviç')) return '/images/categories/breakfast.png';
  if (lowerTitle.includes('donut')) return '/images/categories/donuts.png';
  if (lowerTitle.includes('ekler')) return '/images/categories/eclairs.png';
  if (lowerTitle.includes('kase')) return '/images/categories/bowl_desserts.png';

  // Fallback for others
  if (lowerTitle.includes('kilo')) return '/images/categories/cakes.png';
  return '/images/categories/cakes.png';
};

interface CategoriesProps {
  onNavigate?: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites') => void;
}

const Categories: React.FC<CategoriesProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getActiveCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-basak-cream pb-16 md:pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">Kategoriler yükleniyor...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-basak-cream pb-16 md:pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            Kategorilerimiz
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-medium">
            Canınız ne çekiyorsa, önce kategorinizi seçin.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onNavigate && onNavigate('category')}
              className="group relative block bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden w-full text-left"
            >
              {/* Image Area */}
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img
                  src={getCategoryImage(category.name)}
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-basak-orange/0 group-hover:bg-basak-orange/10 transition-colors duration-300"></div>
              </div>

              {/* Content Area */}
              <div className="p-5 text-center">
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-1 group-hover:text-basak-orange transition-colors">
                  {category.name}
                </h3>
                {category.productCount !== undefined && (
                  <p className="text-sm text-gray-500 font-medium">
                    {category.productCount} ürün
                  </p>
                )}

                {/* Mobile Tap Affordance */}
                <div className="mt-3 inline-flex items-center text-xs font-bold text-basak-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Ürünleri Gör <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Categories;

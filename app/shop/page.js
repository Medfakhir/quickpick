"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

const ShopPage = ({ searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearchQuery = product.name && searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearchQuery;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop</h1>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Product Image */}
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.stock < 10 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    Low Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-xl font-bold text-blue-600">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-2 text-sm text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => router.push(`/product/${product._id}`)}
                    className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Details
                  </button>
                  <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

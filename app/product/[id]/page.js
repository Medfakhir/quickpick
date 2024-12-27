'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

const ProductPage = () => {
  const pathname = usePathname();
  const id = pathname?.split('/').pop();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    try {
      const updatedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = updatedCart.find((item) => item.productId === product._id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        updatedCart.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        });
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err.message);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(); // Add the product to the cart
    router.push('/checkout'); // Redirect to the checkout page
  };

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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Product not found</div>
      </div>
    );
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {product.stock < 10 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  Low Stock
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-4 text-lg text-gray-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 border rounded-md hover:bg-gray-50"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      className="p-2 border rounded-md hover:bg-gray-50"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-gray-500">({product.stock} available)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  className="flex-1 h-12 text-lg border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </button>
                <button
                  className="flex-1 h-12 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Product Description</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

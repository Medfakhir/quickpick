"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  ChevronRight, 
  Truck, 
  Shield, 
  Clock, 
  CreditCard,
  ArrowRight
} from "lucide-react";
import { CartContext } from "../app/layout";

export default function HomePage({ products: initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  const { handleAddToCart } = useContext(CartContext);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      const fetchProducts = async () => {
        try {
          const res = await fetch("/api/products");
          const data = await res.json();
          setProducts(data);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
      fetchProducts();
    }
  }, [initialProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
              <div className="text-white py-16 lg:py-24">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Find Your Perfect Style
                  <span className="block text-blue-200">With Our Collection</span>
                </h1>
                <p className="text-xl mb-8 text-blue-100 max-w-lg">
                  Discover our curated selection of premium products at unbeatable prices
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/shop">
                    <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 flex items-center gap-2">
                      Explore Now <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                  <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition duration-300">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="hidden lg:block relative h-full">
                <svg viewBox="0 0 800 600" className="w-full h-full max-w-xl absolute right-0 top-1/2 transform -translate-y-1/2">
                  {/* Background Elements */}
                  <circle cx="400" cy="300" r="250" fill="#E3F2FD" opacity="0.5"/>
                  <circle cx="400" cy="300" r="200" fill="#BBDEFB" opacity="0.3"/>
                  
                  {/* Shopping Bag */}
                  <path d="M300 200 L500 200 L480 450 L320 450 Z" fill="#2196F3"/>
                  <path d="M320 180 C320 140 350 120 400 120 C450 120 480 140 480 180 L480 200 L320 200 Z" fill="#1976D2"/>
                  
                  {/* Shopping Items */}
                  {/* Box 1 */}
                  <rect x="340" y="250" width="40" height="40" rx="5" fill="#FFF"/>
                  <rect x="350" y="260" width="20" height="20" rx="2" fill="#BBDEFB"/>
                  
                  {/* Box 2 */}
                  <rect x="400" y="270" width="50" height="50" rx="5" fill="#FFF"/>
                  <rect x="410" y="280" width="30" height="30" rx="2" fill="#BBDEFB"/>
                  
                  {/* Box 3 */}
                  <rect x="370" y="340" width="45" height="45" rx="5" fill="#FFF"/>
                  <rect x="380" y="350" width="25" height="25" rx="2" fill="#BBDEFB"/>
                  
                  {/* Decorative Elements */}
                  <circle cx="250" cy="150" r="20" fill="#64B5F6" opacity="0.6"/>
                  <circle cx="550" cy="180" r="15" fill="#64B5F6" opacity="0.6"/>
                  <circle cx="500" cy="400" r="25" fill="#64B5F6" opacity="0.6"/>
                  
                  {/* Stars/Sparkles */}
                  <path d="M220 250 L230 260 L220 270 L210 260 Z" fill="#FFC107"/>
                  <path d="M570 280 L580 290 L570 300 L560 290 Z" fill="#FFC107"/>
                  <path d="M480 120 L490 130 L480 140 L470 130 Z" fill="#FFC107"/>
                  
                  {/* Abstract Lines */}
                  <path d="M200 350 Q 300 380 350 320" stroke="#90CAF9" fill="none" strokeWidth="3"/>
                  <path d="M450 150 Q 550 180 600 280" stroke="#90CAF9" fill="none" strokeWidth="3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <Truck className="w-10 h-10 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <Shield className="w-10 h-10 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <Clock className="w-10 h-10 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                <p className="text-sm text-gray-600">Ready to help you</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <CreditCard className="w-10 h-10 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Easy Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Best Sellers</h2>
              <p className="text-gray-600">Discover our most popular items</p>
            </div>
            <Link href="/shop" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => (
              <div
                key={product.id || index}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <Link href={`/product/${product._id}`}>
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 text-xs rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xl font-bold text-gray-900">${product.price}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">${product.originalPrice}</p>
                        )}
                      </div>
                      <button className="text-sm text-blue-600 font-medium group-hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg 
                     transition-colors duration-200 flex items-center justify-center gap-2
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-blue-100 mb-8">Get updates about new products and special offers</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
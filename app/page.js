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
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500">
          <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-white max-w-2xl">
                <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                  Discover Your
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                    Perfect Style
                  </span>
                </h1>
                <p className="text-lg lg:text-xl mb-12 text-blue-100/90">
                  Explore our handpicked collection of premium products designed to elevate your lifestyle. Quality meets affordability.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link href="/shop">
                    <button className="group px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 flex items-center gap-3">
                      Shop Collection
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <button className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex justify-center items-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent rounded-full blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {products.slice(0, 4).map((product, index) => (
                      <div key={index} className="rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders over $100" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: Clock, title: "24/7 Support", desc: "Here to help anytime" },
              { icon: CreditCard, title: "Easy Returns", desc: "30-day guarantee" }
            ].map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-zinc-900">{feature.title}</h3>
                <p className="text-sm text-zinc-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-2">Trending Now</h2>
              <p className="text-zinc-600">Discover our most-loved pieces</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              View All 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => (
              <div key={index} className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all duration-300">
                <Link href={`/product/${product._id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount && (
                      <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 text-xs rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-zinc-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-zinc-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-sm text-blue-600 font-medium group-hover:underline">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl
                     transition-colors duration-300 flex items-center justify-center gap-2
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
      <section className="py-20 bg-gradient-to-br from-zinc-900 to-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h2>
            <p className="text-zinc-300 mb-8">Subscribe for exclusive offers and new arrivals</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
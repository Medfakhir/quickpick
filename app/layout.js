'use client';
import React, { createContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Search, ChevronDown } from 'lucide-react';
import './globals.css';


// Cart Context for global cart state management
export const CartContext = createContext();

export default function Layout({ children }) {
  const pathname = usePathname(); // Get the current page path
  const router = useRouter(); // Next.js router for navigation and refresh

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]); // State to hold cart items
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [products, setProducts] = useState([]); // State to hold products
  const [filteredProducts, setFilteredProducts] = useState([]); // State for filtered products
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // State to toggle dropdown visibility

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser({
          name: decodedToken.name,
          email: decodedToken.email,
        });
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    // Fetch all products
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    // Load cart from localStorage
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(savedCart);
    };

    fetchProducts();
    loadCart();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      setIsDropdownVisible(true); // Show dropdown when query is entered
    } else {
      setFilteredProducts([]);
      setIsDropdownVisible(false); // Hide dropdown when query is cleared
    }
  }, [searchQuery, products]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]); // Clear cart on logout
    router.refresh(); // Refresh the page to update the UI
  };

  const handleAddToCart = (product) => {
    try {
      const updatedCart = [...cart];
      const existingItem = updatedCart.find((item) => item.productId === product._id);
  
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedCart.push({
          productId: product._id,
          name: product.name,         // Add product name
          price: product.price,
          image: product.image,       // Add product image
          quantity: 1
        });
      }
  
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };
  
  

  const handleProductClick = () => {
    setIsDropdownVisible(false); // Hide dropdown when a product is clicked
    setSearchQuery(''); // Clear search query
  };

  const excludeNavFooter = pathname.includes('/admin');

  return (
    <CartContext.Provider value={{ cart, handleAddToCart }}>
      <html lang="en">
        <body className="antialiased">
          {!excludeNavFooter && (
            <>
              {/* Navigation Bar */}
              <nav className="bg-white shadow-md fixed w-full z-10 top-0">
                <div className="container mx-auto px-4">
                  <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                      <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold bg-blue-600 text-white p-2 rounded-lg">
                          QP
                        </div>
                        <span className="text-xl font-bold text-gray-800">QuickPick</span>
                      </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-72 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-4 top-2.5 text-gray-400 w-5 h-5" />
                        {/* Dropdown results */}
                        {isDropdownVisible && (
                          <div className="absolute w-full bg-white shadow-lg rounded-lg mt-2 z-20">
                            {filteredProducts.length > 0 ? (
                              <ul className="divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                  <li
                                    key={product._id}
                                    className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 transition cursor-pointer"
                                    onClick={handleProductClick}
                                  >
                                    <img
                                      src={product.image || 'https://via.placeholder.com/50'}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                      <Link href={`/product/${product._id}`} className="block">
                                        <p className="text-sm font-medium text-gray-800 hover:text-blue-600 transition">
                                          {product.name}
                                        </p>
                                      </Link>
                                      <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="py-4 px-4 text-gray-500">No products found.</div>
                            )}
                          </div>
                        )}
                      </div>
                      <Link href="/cart" className="relative">
                        <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-blue-600" />
                        {cart.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                          </span>
                        )}
                      </Link>

                      {user ? (
                        <div className="relative">
                          <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                          >
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-700">{user.name}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>

                          {/* Profile Dropdown Menu */}
                          {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                              <Link href="/profile">
                                <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</span>
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                              >
                                Logout
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex space-x-4">
                          <Link href="/login">
                            <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                              Login
                            </button>
                          </Link>
                          <Link href="/register">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
                              Register
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </nav>
            </>
          )}

          {/* Main Content */}
          <main>{children}</main>

          {!excludeNavFooter && (
             <footer className="bg-gray-900">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Company Info */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">QuickPick</h3>
                  <p className="text-gray-400 mb-4">Your one-stop destination for quality products and exceptional service.</p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                  </div>
                </div>
      
                {/* Quick Links */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a>
                    </li>
                    <li>
                      <a href="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</a>
                    </li>
                    <li>
                      <a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</a>
                    </li>
                    <li>
                      <a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                    </li>
                    <li>
                      <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                    </li>
                  </ul>
                </div>
      
                {/* Contact Info */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
                  <ul className="space-y-4">
                    <li className="text-gray-400">
                      <a href="mailto:info@quickpick.com" className="hover:text-white transition-colors">
                        info@quickpick.com
                      </a>
                    </li>
                    <li className="text-gray-400">
                      <a href="tel:+1234567890" className="hover:text-white transition-colors">
                        (123) 456-7890
                      </a>
                    </li>
                    <li className="text-gray-400">
                      123 Commerce Street<br />
                      New York, NY 10001
                    </li>
                  </ul>
                </div>
      
                {/* Newsletter */}
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4">Stay Updated</h3>
                  <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
                  <form className="space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
      
            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <p className="text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} QuickPick. All Rights Reserved and By MeDev.
                  </p>
                  <div className="flex space-x-6">
                    <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                      Terms of Service
                    </a>
                    <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                      Privacy Policy
                    </a>
                    <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                      Cookie Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
          )}
        </body>
      </html>
    </CartContext.Provider>
  );
}

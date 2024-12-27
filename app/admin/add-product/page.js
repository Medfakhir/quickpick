'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Home Appliances', 'Books', 'Toys']); // Predefined categories
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // Redirect if not logged in
      return;
    }

    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    if (decoded.role === 'admin') {
      setIsAdmin(true); // Allow access if admin
    } else {
      router.push('/unauthorized'); // Redirect if not admin
    }
  }, [router]);

  const handleStockChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      setStock(value === '' ? '' : parseInt(value, 10));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      alert('Please select a category.');
      return;
    }

    const productData = { name, price, description, image, stock, category };
    const token = localStorage.getItem('token');

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      alert('Failed to add product');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="mt-2 text-gray-600">Fill in the details to add a new product to your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  value={stock}
                  onChange={handleStockChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

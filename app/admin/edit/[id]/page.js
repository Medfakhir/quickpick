'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function EditProductPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories] = useState(['Electronics', 'Clothing', 'Home Appliances', 'Books', 'Toys']); // Predefined categories
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    stock: '',
    category: ''
  });
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRes = await fetch(`/api/products/${id}`);
        if (!productRes.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await productRes.json();
        
        setFormData({
          name: productData.name || '',
          price: productData.price?.toString() || '',
          description: productData.description || '',
          image: productData.image || '',
          stock: productData.stock?.toString() || '',
          category: productData.category || ''
        });
        setProduct(productData);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updatedProduct = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.image,
        stock: parseInt(formData.stock, 10),
        category: formData.category
      };

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      router.push('/admin');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="mt-2 text-gray-600">Update your product information</p>
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
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
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="0.00"
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
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="0"
                  required
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 resize-none"
                  placeholder="Enter product description"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
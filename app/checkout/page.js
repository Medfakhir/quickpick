"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCartAndUser = async () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to complete your purchase.");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.userId;

        const userResponse = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        }
      } catch (err) {
        console.error("Error loading checkout data:", err.message);
        setError("Failed to load checkout data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to complete the order.");
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please provide all required fields: name, phone, and address.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          user: formData,
        }),
      });

      if (response.ok) {
        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        router.push("/success");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Error placing order:", err.message);
      alert("An error occurred while placing the order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="divide-y divide-gray-200">
                  {cart.map((item, index) => (
                    <div key={index} className="py-4 flex items-start space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your complete address"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Total</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(savedCart);
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
    fetchProducts();
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Add some products before proceeding.");
      return;
    }
    router.push("/checkout");
  };

  const cartWithDetails = cart.map((cartItem) => {
    const product = products.find((p) => p._id === cartItem.productId);

    if (product) {
      return {
        ...cartItem,
        name: product.name,
        image: product.image,
        price: product.price || cartItem.price,
      };
    }

    return cartItem;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalAmount = cartWithDetails.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>

        {cartWithDetails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {cartWithDetails.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center p-6 ${
                    index !== cartWithDetails.length - 1 ? "border-b" : ""
                  }`}
                >
                  <img
                    src={item.image || "https://via.placeholder.com/100"}
                    alt={item.name || "Product"}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1 ml-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {item.name || "Unknown Product"}
                    </h2>
                    <div className="flex items-center mt-3 space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-gray-600">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-600 text-sm mt-2 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="text-lg font-semibold">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

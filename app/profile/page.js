'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode } from "jwt-decode";
import { User, Package, LogOut,Shield } from 'lucide-react';

export default function EcommerceProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountSettings, setAccountSettings] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const router = useRouter();



  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
  
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
  
        const userRes = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!userRes.ok) {
          throw new Error(`Failed to fetch user data: ${userRes.statusText}`);
        }
  
        const userData = await userRes.json();
        setUser(userData);
        setAccountSettings({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        });
  
        const ordersRes = await fetch(`/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!ordersRes.ok) {
          throw new Error(`Failed to fetch orders: ${ordersRes.statusText}`);
        }
  
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
  
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [router]);
  

  

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in. Please log in.');
        router.push('/login');
        return;
      }
  
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountSettings),
      });
  
      const responseData = await res.json();
      console.log('API Response:', responseData);
  
      if (!res.ok) {
        console.error('API error:', responseData);
        throw new Error(responseData.error || 'Failed to update profile');
      }
  
      setUser(responseData.user);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err.message);
      alert(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
  
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in. Please log in.');
        router.push('/login');
        return;
      }
  
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'POST', // Ensure your API handles POST for password change
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update password.');
      }
  
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      alert(error.message);
    }
  };
  

  const renderSecuritySection = () => (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Security</h2>
      <form onSubmit={handlePasswordChange} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter current password"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Confirm new password"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );

  const renderProfileSection = () => {
    if (!user) return null;

    return (
      <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center">
                  <User 
                    size={48}
                    className="text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {user?.name || 'Anonymous User'}
            </h2>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={accountSettings.name}
                  onChange={(e) =>
                    setAccountSettings({ ...accountSettings, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={accountSettings.email}
                  onChange={(e) =>
                    setAccountSettings({ ...accountSettings, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={accountSettings.phone}
                  onChange={(e) =>
                    setAccountSettings({ ...accountSettings, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={accountSettings.address}
                  onChange={(e) =>
                    setAccountSettings({ ...accountSettings, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    );
  };



  const renderOrdersSection  = () => {
    const handleCancelOrder = async (orderId, createdAt) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You are not logged in. Please log in.");
          return;
        }
  
        const orderTime = new Date(createdAt);
        const currentTime = new Date();
        const timeDifference = currentTime - orderTime;
        const fourHours = 4 * 60 * 60 * 1000;
  
        if (timeDifference > fourHours) {
          alert("You cannot cancel the order after 4 hours.");
          return;
        }
  
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId, status: "Canceled" }),
        });
  
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to cancel order.");
        }
  
        alert("Order canceled successfully!");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Canceled" } : order
          )
        );
      } catch (err) {
        console.error("Error canceling order:", err.message);
        alert(err.message);
      }
    };
  
    if (orders.length === 0) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <p className="text-gray-500 text-lg">No orders yet.</p>
        </div>
      );
    }
  
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h2>
        <div className="space-y-6">
          {orders.map((order) => {
            const orderTime = new Date(order.createdAt);
            const currentTime = new Date();
            const timeDifference = currentTime - orderTime;
            const isCancelable = timeDifference <= 4 * 60 * 60 * 1000;
  
            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order._id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${order.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Canceled' ? 'bg-red-100 text-red-800' :
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
  
                  <div className="divide-y divide-gray-100">
                    {order.products.map((product) => (
                      <div key={product.productId} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <img
                            src={product.image || '/default-product-image.jpg'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <div className="mt-1 flex items-center gap-4">
                              <p className="text-sm text-gray-500">
                                Qty: {product.quantity}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ${(product.price * product.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">
                      Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                    </p>
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id, order.createdAt)}
                        disabled={!isCancelable}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                          ${isCancelable 
                            ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-[100px] min-h-screen">
      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        <div className="bg-white shadow-md rounded-lg p-4">
          <nav className="space-y-2">
            {[{ icon: <User className="mr-2" />, label: 'Profile', section: 'profile' },
              { icon: <Package className="mr-2" />, label: 'Orders', section: 'orders' },
              { icon: <Shield className="mr-2" />, label: 'Security', section: 'security' },
              { icon: <LogOut className="mr-2" />, label: 'Logout', onClick: handleLogout },
            ].map((item) =>
              item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <button
                  key={item.label}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full text-left flex items-center px-4 py-2 rounded ${
                    activeSection === item.section
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            )}
          </nav>
        </div>
        <div>
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'orders' && renderOrdersSection()}
          {activeSection === 'security' && renderSecuritySection()}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Trash2,
  Edit,
  PlusCircle,
  Menu,
  LayoutDashboard,
  LogOut,
  DollarSign,
  Archive,
  ListOrdered
  ,Users,
} from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0); 
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const role = decodedToken.role;

    if (role !== 'admin') {
      router.push('/profile');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch products
        const productRes = await fetch('/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!productRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productRes.json();
        setProducts(productsData);
        setTotalProducts(productsData.length);

        // Fetch orders
        const orderRes = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!orderRes.ok) throw new Error('Failed to fetch orders');
        const ordersData = await orderRes.json();
        setTotalOrders(ordersData.length);

        // Fetch users
        const userRes = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Failed to fetch users');
        const usersData = await userRes.json();
        setTotalUsers(usersData.length);
      } catch (err) {
        setError(err.message);
      }
    };
    

    fetchDashboardData();
  }, [router]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter((product) => product._id !== id));
      setTotalProducts(totalProducts - 1);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const calculateAveragePrice = (products) => {
    if (!products.length) return 0;
    const total = products.reduce((sum, product) => sum + product.price, 0);
    return (total / products.length).toFixed(2);
  };

  const countCategories = (products) => {
    const categories = new Set(products.map((product) => product.category));
    return categories.size;
  };
  const countLowStock = (products) => {
    return products.filter((product) => product.stock < 3).length;
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Package className="w-6 h-6 text-green-500" />}
              title="Total Products"
              value={totalProducts}
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6 text-blue-500" />}
              title="Average Price"
              value={`$${calculateAveragePrice(products)}`}
            />
            <StatCard
              icon={<Archive className="w-6 h-6 text-purple-500" />}
              title="Categories"
              value={countCategories(products)}
            />
            <StatCard
              icon={<ListOrdered className="w-6 h-6 text-orange-500" />}
              title="Total Orders"
              value={totalOrders} // Display total orders
            />
             <StatCard
              icon={<Users className="w-6 h-6 text-blue-500" />}
              title="Total Users"
              value={totalUsers}
            />
          </div>
        );
      case 'products':
        return (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={handleDelete}
                  onEdit={() => router.push(`/admin/edit/${product._id}`)}
                />
              ))}
              <AddProductCard onClick={() => router.push('/admin/add-product')} />
            </div>
          </div>
        );
      case 'orders':
        return <OrderManagement />;
      case 'users':
          return <UserManagement />;
      default:
        return null;
    }
  };
  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white w-64 p-6 border-r transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden'}`}
      >
        <div className="flex items-center mb-10">
          <div className="text-2xl font-bold bg-blue-600 text-white p-2 rounded-lg mr-2">
            QP
          </div>
          <span className="text-xl font-bold text-gray-800">QuickPick</span>
        </div>

        <nav>
          <SidebarItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={activeSection === 'dashboard'}
            onClick={() => setActiveSection('dashboard')}
          />
          <SidebarItem
            icon={<Package />}
            label="Products"
            active={activeSection === 'products'}
            onClick={() => setActiveSection('products')}
          />
          <SidebarItem
            icon={<ListOrdered />}
            label="Orders"
            active={activeSection === 'Orders'}
            onClick={() => setActiveSection('orders')}
          />
          <SidebarItem
            icon={<Users />}
            label="Users"
            active={activeSection === 'users'}
            onClick={() => setActiveSection('users')}
          />
        </nav>

        <div className="absolute bottom-6 w-52">
          <SidebarItem
            icon={<LogOut className="w-5 h-5 text-red-600" />}
            label="Logout"
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                A
              </div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </div>

        <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
  {activeSection === 'dashboard'
    ? 'Dashboard'
    : activeSection === 'products'
    ? 'Product Management'
    : activeSection === 'orders'
    ? 'Order Management'
    : 'Section'}
</h1>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUsers();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No users available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {users.map((user) => (
    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address}</td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};
const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center space-x-4">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, onDelete, onEdit }) => {
  const maxDescriptionLength = 100;
  const shortDescription = product.description.slice(0, maxDescriptionLength);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={onEdit}
            className="bg-white/90 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="bg-white/90 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold line-clamp-1">{product.name}</h2>
          <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {product.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{shortDescription}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">${product.price}</span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </div>
  );
};

const AddProductCard = ({ onClick }) => (
  <div
    onClick={onClick}
    className="bg-white/50 rounded-xl shadow-md overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white hover:shadow-lg transition group h-full min-h-[300px]"
  >
    <div className="text-center p-8">
      <PlusCircle className="w-12 h-12 mx-auto text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
      <p className="text-gray-600 font-semibold">Add New Product</p>
    </div>
  </div>
);

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await res.json();
      
      // Only update the status of the order, keeping other fields unchanged
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId 
            ? { ...order, status: newStatus }  // Keep all existing order data, just update status
            : order
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Delivered: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Canceled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.Pending}`}>
        {status}
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
             
              <tbody className="bg-white divide-y divide-gray-200">
  {orders.map((order) => (
    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
        {order._id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.products.map((product, index) => (
          <div key={index}>
            <p>{product.name}</p>
            <p className="text-gray-500 text-xs">
              {product.quantity} x ${product.price.toFixed(2)}
            </p>
          </div>
        ))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.userDetails?.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${order.totalAmount?.toFixed(2) || '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(order.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={() => handleOrderStatusChange(order._id, 'Delivered')}
            className="px-3 py-1 text-sm border border-green-500 text-green-600 rounded hover:bg-green-50 transition-colors"
          >
            Mark Delivered
          </button>
          <button
            onClick={() => handleOrderStatusChange(order._id, 'Pending')}
            className="px-3 py-1 text-sm border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 transition-colors"
          >
            Mark Pending
          </button>
          <button
            onClick={() => handleOrderStatusChange(order._id, 'Canceled')}
            className="px-3 py-1 text-sm border border-red-500 text-red-600 rounded hover:bg-red-50 transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

           
            </table>
          </div>
        )}
      </div>
    </div>
  );
};





const SidebarItem = ({ icon, label, active, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} ${className}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default AdminDashboard;

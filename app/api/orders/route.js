import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { headers } from 'next/headers';

// Handle Order Creation
export async function POST(req) {
  try {
    const headersList = await req.headers;
    const authorization = headersList.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication token is missing or invalid' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    console.log('Request body received in server:', body);

    const { items, user: userData } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!userData.name || !userData.phone || !userData.address) {
      return NextResponse.json(
        { error: 'User details (name, phone, address) are required' },
        { status: 400 }
      );
    }

    const orderProducts = items.map(({ productId, quantity, price, name }) => ({
      productId,
      name,
      quantity,
      price,
      total: price * quantity,
    }));

    let totalAmount = orderProducts.reduce((sum, item) => sum + item.total, 0);

    user.name = userData.name || user.name;
    user.phone = userData.phone || user.phone;
    user.address = userData.address || user.address;
    await user.save();

    const newOrder = await Order.create({
      userId: user._id,
      products: orderProducts,
      totalAmount,
      status: 'Pending',
      userDetails: {
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
      },
    });

    return NextResponse.json(
      { message: 'Order created successfully', order: newOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




// Handle Order Fetching
export async function GET(req) {
  try {
    const headersList = req.headers;
    const authorization = headersList.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication token is missing or invalid' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let orders;

    if (user.role === 'admin') {
      // Fetch all orders for admin
      orders = await Order.find().sort({ createdAt: -1 }).lean();
    } else {
      // Fetch only the user's own orders
      orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    }

    // Populate user and product details
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const userDetails = user.role === 'admin' 
          ? await User.findById(order.userId).lean() 
          : user;

        const productDetails = Array.isArray(order.products)
          ? await Promise.all(
              order.products.map(async (product) => {
                const productData = await Product.findById(product.productId).lean();
                return {
                  ...product,
                  name: productData?.name || 'Unknown Product',
                  price: productData?.price || 0,
                  image: productData?.image || '/default-product-image.jpg',
                };
              })
            )
          : [];

        // Calculate totalAmount
        const totalAmount = productDetails.reduce(
          (sum, product) => sum + product.quantity * product.price,
          0
        );

        return {
          ...order,
          totalAmount: totalAmount || 0,
          userDetails: {
            name: userDetails?.name || 'Unknown User',
            email: userDetails?.email || 'No Email',
          },
          products: productDetails,
        };
      })
    );

    return NextResponse.json(populatedOrders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}








// Handle Order Updates (Status Changes)
/*export async function PUT(req) {
  try {
    const headersList = await headers();
    const authorization = await headersList.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication token is missing or invalid' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Allow admins to update any status
    if (user.role === 'admin') {
      order.status = status;
      await order.save();
      return NextResponse.json(order, { status: 200 });
    }

    // If the user is not an admin, restrict them
    return NextResponse.json(
      { error: 'Unauthorized action. Admins only.' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}*/



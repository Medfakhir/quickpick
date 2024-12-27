import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate token
    const authorization = req.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication token is missing or invalid" },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token. Please log in again." },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Fetch the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch the order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Admin permissions for updating status
    if (user.role === 'admin') {
      order.status = status;
      await order.save();
      return NextResponse.json(order, { status: 200 });
    }

    // User permissions: Cancelation only
    if (status === 'Canceled') {
      const timeElapsed = Date.now() - new Date(order.createdAt).getTime();
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      if (hoursElapsed > 3) {
        return NextResponse.json(
          { error: "You cannot cancel the order after 3 hours." },
          { status: 400 }
        );
      }

      if (order.userId.toString() !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to cancel this order." },
          { status: 403 }
        );
      }

      order.status = status;
      await order.save();
      return NextResponse.json(order, { status: 200 });
    }

    // Invalid action or unauthorized user
    return NextResponse.json(
      { error: "Unauthorized action or invalid status update." },
      { status: 403 }
    );
  } catch (err) {
    console.error("Error processing order update:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

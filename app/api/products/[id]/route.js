// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(req, { params }) {
  const { id } = await params
  
  try {
    await connectToDatabase();
    
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Ensure required fields are valid
    const { name, price, description, image, stock, category } = body;
    if (!name || !price || !description || !image || stock == null || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.stock = stock;
    product.category = category;

    await product.save();

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Validate ObjectId format
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    await product.deleteOne();

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
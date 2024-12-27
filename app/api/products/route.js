// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    await connectToDatabase();

    // Parse category filter from query params
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const query = category ? { category } : {};
    const products = await Product.find(query);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(req) {
  const { name, price, description, image, stock, category } = await req.json();

  if (!name || !price || !description || !category) {
    return NextResponse.json(
      { error: 'Name, price, description, and category are required.' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const product = new Product({
      name,
      price,
      description,
      image,
      stock: stock || 0, // Default to 0 if stock is not provided
      category, // Add category field
    });

    await product.save();
    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

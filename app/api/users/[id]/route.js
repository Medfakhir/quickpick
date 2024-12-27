import { MongoClient, ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import bcrypt from 'bcrypt';

// Move client initialization inside functions to avoid build-time errors
let client = null;

async function getMongoClient() {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    client = new MongoClient(process.env.DATABASE_URL);
  }
  
  if (!client.isConnected()) {
    await client.connect();
  }
  return client;
}

// Helper function to verify JWT
function verifyAuth(token, userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const decoded = verify(token, process.env.JWT_SECRET);
  if (decoded.userId !== userId) {
    throw new Error('Unauthorized');
  }
  return decoded;
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    // Verify auth
    try {
      verifyAuth(token, id);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const mongoClient = await getMongoClient();
    const db = mongoClient.db('test');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: objectId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      cart: user.cart || [],
    }, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    // Verify auth
    try {
      verifyAuth(token, id);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const updates = await req.json();
    
    // Validate updates
    const allowedFields = ['name', 'email', 'phone', 'address'];
    const sanitizedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    const mongoClient = await getMongoClient();
    const db = mongoClient.db('test');
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ _id: objectId });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: sanitizedUpdates,
        $currentDate: { lastModified: true }
      },
      { 
        returnDocument: 'after'
      }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    // Verify auth
    try {
      verifyAuth(token, id);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await req.json();

    // Handle password update
    if (body.currentPassword && body.newPassword) {
      return await handlePasswordUpdate(objectId, body);
    }

    // Handle add-to-cart
    if (body.productId && body.quantity && body.price) {
      return await handleAddToCart(objectId, body);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePasswordUpdate(userId, { currentPassword, newPassword }) {
  const mongoClient = await getMongoClient();
  const db = mongoClient.db('test');
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ _id: userId });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Incorrect current password' }, { status: 403 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await usersCollection.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } }
  );

  if (result.modifiedCount === 0) {
    return NextResponse.json({ error: 'Password update failed' }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, message: 'Password updated successfully' },
    { status: 200 }
  );
}

async function handleAddToCart(userId, { productId, quantity, price }) {
  const mongoClient = await getMongoClient();
  const db = mongoClient.db('test');
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ _id: userId });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const productObjectId = new ObjectId(productId);
    const existingProduct = user.cart?.find(
      (item) => item.productId.toString() === productId
    );

    if (existingProduct) {
      await usersCollection.updateOne(
        { _id: userId, 'cart.productId': productObjectId },
        { $inc: { 'cart.$.quantity': quantity } }
      );
    } else {
      await usersCollection.updateOne(
        { _id: userId },
        {
          $push: {
            cart: { productId: productObjectId, quantity, price }
          }
        }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product added to cart' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
}
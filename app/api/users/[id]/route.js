import { MongoClient, ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import bcrypt from 'bcrypt';

// Create a single client instance
const client = new MongoClient(process.env.DATABASE_URL);

// Helper function to get MongoDB client
async function getMongoClient() {
  if (!client.isConnected()) await client.connect();
  return client;
}

export async function GET(req, { params }) {
  const { id } = params;
  const headersList = headers();
  const token = headersList.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET);

    // Check token match
    if (decoded.userId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
  } catch (err) {
    console.error('Error verifying token or fetching user:', err);
    return NextResponse.json(
      { error: 'Invalid token or user not found' },
      { status: 401 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { id } = params;
  const headersList = headers();
  const token = headersList.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== id) {
      console.error("Token user ID mismatch:", decoded.userId, id);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();
    console.log("Updates:", updates);

    // Validate updates
    const allowedFields = ['name', 'email', 'phone', 'address'];
    const sanitizedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    const mongoClient = await getMongoClient();
    const db = mongoClient.db("test");
    const usersCollection = db.collection("users");

    // Check if user exists
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

    const userToReturn = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address
    };

    return NextResponse.json({
      success: true,
      user: userToReturn
    }, { status: 200 });

  } catch (error) {
    console.error("Error in PATCH handler:", error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = params;
  const headersList = headers();
  const token = headersList.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    console.error('Error in POST handler:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper functions for POST route
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
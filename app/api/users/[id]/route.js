import { MongoClient, ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
const bcrypt = require('bcrypt');

const client = new MongoClient(process.env.DATABASE_URL); // MongoDB connection URI from .env

export async function GET(req, { params }) {
  const { id } = await params; // Get user ID from the URL
  const token = req.headers.get('Authorization')?.split(' ')[1]; // Get token from the header

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Verify the token with your secret
    const decoded = verify(token, process.env.JWT_SECRET);

    // If the decoded userId does not match the requested id, return forbidden
    if (decoded.userId !== id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db('test'); // Use your actual database name
    const usersCollection = db.collection('users'); // Replace with your users collection name

    // Fetch the user from MongoDB by userId
    const user = await usersCollection.findOne({ _id: new ObjectId(id) }); // Find user by ObjectId

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Return the user data including the cart
    return new Response(
      JSON.stringify({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '', // Include phone
        address: user.address || '', // Include address
        role: user.role,
        cart: user.cart || [], // Include cart
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error verifying token or fetching user:', err);
    return new Response(
      JSON.stringify({ error: 'Invalid token or user not found' }),
      { status: 401 }
    );
  } finally {
    // Close MongoDB connection
    await client.close();
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
      console.error("Invalid ObjectId:", id);
      return new Response(JSON.stringify({ error: "Invalid user ID" }), { status: 400 });
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== id) {
      console.error("Token user ID mismatch:", decoded.userId, id);
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const updates = await req.json();
    console.log("Updates:", updates);

    // Add validation for updates
    const allowedFields = ['name', 'email', 'phone', 'address'];
    const sanitizedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    // Convert ID to ObjectId for querying
    const objectId = new ObjectId(id);

    await client.connect();
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // First check if user exists
    const existingUser = await usersCollection.findOne({ _id: objectId });
    if (!existingUser) {
      console.error("User not found for ObjectId:", objectId);
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
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
      return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
    }

    // Remove sensitive information before sending response
    const userToReturn = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address
    };

    return new Response(
      JSON.stringify({
        success: true,
        user: userToReturn
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error in PATCH handler:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 });
    }

    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await req.json();

    // Check if it's a password update request
    if (body.currentPassword && body.newPassword) {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Current and new passwords are required' }),
          { status: 400 }
        );
      }

      await client.connect();
      const db = client.db('test');
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return new Response(JSON.stringify({ error: 'Incorrect current password' }), { status: 403 });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: hashedPassword } }
      );

      if (result.modifiedCount === 0) {
        return new Response(
          JSON.stringify({ error: 'Password update failed' }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Password updated successfully' }),
        { status: 200 }
      );
    }

    // Check if it's an add-to-cart request
    if (body.productId && body.quantity && body.price) {
      const { productId, quantity, price } = body;

      if (!productId || !quantity || !price) {
        return new Response(
          JSON.stringify({ error: 'Product ID, quantity, and price are required' }),
          { status: 400 }
        );
      }

      await client.connect();
      const db = client.db('test');
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      }

      // Check if product already exists in cart
      const existingProduct = user.cart.find((item) => item.productId.toString() === productId);

      if (existingProduct) {
        // Update the quantity of the existing product
        await usersCollection.updateOne(
          { _id: new ObjectId(id), 'cart.productId': new ObjectId(productId) },
          { $inc: { 'cart.$.quantity': quantity } }
        );
      } else {
        // Add new product to the cart
        await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $push: {
              cart: { productId: new ObjectId(productId), quantity, price },
            },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Product added to cart' }),
        { status: 200 }
      );
    }

    // If neither password update nor add to cart matches
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  } catch (error) {
    console.error('Error in POST handler:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}










import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.DATABASE_URL);

export async function GET(req) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    const token = authorizationHeader?.split(' ')[1]; // Extract token

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET);

    // Check if the user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Connect to the database
    if (!client.isConnected) {
      await client.connect();
    }
    const db = client.db('test'); // Use your actual database name
    const usersCollection = db.collection('users'); // Ensure this matches your collection name

    // Fetch all users
    const users = await usersCollection.find({}).toArray();

    if (!users.length) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }

    // Map users and return response
    const responseData = users.map((user) => ({
      id: user._id.toString(),
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      role: user.role || 'N/A',
      phone: user.phone || 'N/A',
      address: user.address || 'N/A',
    }));

    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

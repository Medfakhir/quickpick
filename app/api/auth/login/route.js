// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongodb';

export async function POST(req) {
  const { email, password } = await req.json();

  // Check if the user exists
  await connectToDatabase();
  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if the password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create a JWT token with the user role (you can send this in the response body)
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Send token in the response body (no cookies)
  return NextResponse.json({ message: 'Login successful', token });
}

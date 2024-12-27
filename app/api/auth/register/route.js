// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongodb';

export async function POST(req) {
  const { email, password, confirmPassword } = await req.json();

  // Validate passwords match
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  }

  // Check if the user already exists
  await connectToDatabase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    role: 'user',  // Default role is 'user'
  });

  await user.save();

  return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
}

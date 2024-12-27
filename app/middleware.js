import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function middleware(req) {
  const token =
    req.headers.get('Authorization')?.split(' ')[1] ||
    req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If the user is not an admin, redirect them to the Unauthorized page
    if (decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  } catch (err) {
    console.error('Middleware Error:', err.message);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next(); // Allow access if the user is admin
}

export const config = {
  matcher: ['/admin/:path*'], // Protect all routes under /admin
};

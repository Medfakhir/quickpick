import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded; // Return the decoded payload (e.g., user ID)
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

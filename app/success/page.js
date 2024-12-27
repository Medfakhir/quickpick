"use client"
import React from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Success() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Thank You for Your Order!
        </h1>
        
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-green-700">
            Your purchase has been successfully completed
          </p>
        </div>

        {/* Email Confirmation Notice */}
        <p className="text-gray-600 mb-8">
          A confirmation email will be sent to your inbox shortly
        </p>

        {/* Return Home Button */}
        <button
          onClick={() => router.push('/')}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </button>
      </div>
    </div>
  );
}
export default function UnauthorizedPage() {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-4">You do not have permission to access this page.</p>
        <a href="/" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded">
          Go to Home
        </a>
      </div>
    );
  }
  
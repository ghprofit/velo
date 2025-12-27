import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/assets/logo_svgs/Secondary_Logo(white).svg"
            alt="Velo"
            className="h-12 mx-auto"
          />
        </div>

        {/* 404 */}
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>

        {/* Message */}
        <h2 className="text-3xl font-semibold text-white mb-4">
          This page could not be found
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

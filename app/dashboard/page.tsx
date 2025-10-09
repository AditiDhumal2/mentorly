export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Your Dashboard!
          </h1>
          <p className="text-gray-300 text-lg">
            Authentication is working perfectly! 🎉
          </p>
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 max-w-md mx-auto">
            <p className="text-cyan-300">
              Your login was successful and you've been redirected to the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
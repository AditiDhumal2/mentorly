export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
            <p className="text-gray-600">Dashboard content goes here...</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-gray-600">Recent activities will appear here...</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Admin Tools</h3>
            <p className="text-gray-600">Admin management tools...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
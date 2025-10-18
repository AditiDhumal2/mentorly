interface DashboardHeaderProps {
  title: string;
  description: string;
  showLastUpdated?: boolean;
}

export default function DashboardHeader({ 
  title, 
  description, 
  showLastUpdated = false 
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      {showLastUpdated && (
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
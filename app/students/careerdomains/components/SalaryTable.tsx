// app/students/careerdomains/components/SalaryTable.tsx
interface SalaryTableProps {
  salary: {
    india: string;
    abroad: string;
  };
  roles: string[];
}

export default function SalaryTable({ salary, roles }: SalaryTableProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Salary
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                India
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {salary?.india || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                International
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {salary?.abroad || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {roles && roles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Common Roles & Positions</h3>
          <div className="flex flex-wrap gap-2">
            {roles.map((role, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
interface SalaryData {
  role: string;
  india: number;
  abroad: number;
}

interface SalaryTableProps {
  salaries: SalaryData[];
}

export default function SalaryTable({ salaries }: SalaryTableProps) {
  const formatSalary = (amount: number, isIndia: boolean = true) => {
    if (isIndia) {
      return `₹${amount}L`;
    }
    return `$${amount}k`;
  };

  return (
    <div className="overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-sm font-medium text-gray-500 py-3">Role</th>
            <th className="text-right text-sm font-medium text-gray-500 py-3">India</th>
            <th className="text-right text-sm font-medium text-gray-500 py-3">Abroad</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((salary) => (
            <tr key={salary.role} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="py-3 text-sm font-medium text-gray-900">{salary.role}</td>
              <td className="py-3 text-right text-sm text-green-600 font-medium">
                {formatSalary(salary.india, true)}
              </td>
              <td className="py-3 text-right text-sm text-blue-600 font-medium">
                {formatSalary(salary.abroad, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
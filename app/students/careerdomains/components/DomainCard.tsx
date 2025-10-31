import Link from 'next/link';
import { ICareerDomain } from '@/types/careerDomains';

interface DomainCardProps {
  domain: ICareerDomain;
}

// Helper function to generate slug from domain name
function generateSlug(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  console.log('Generated slug for', name, ':', slug); // Debug log
  return slug;
}

export default function DomainCard({ domain }: DomainCardProps) {
  const slug = generateSlug(domain.name);

  const formatSalary = (salary: string | undefined) => {
    if (!salary) return 'Not available';
    return salary;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {domain.name}
        </h3>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {domain.description}
      </p>

      {/* Skills Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h4>
        <div className="flex flex-wrap gap-1">
          {domain.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {domain.skills && domain.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
              +{domain.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Salary Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Average Salary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-700 font-semibold">
              {formatSalary(domain.averageSalary?.india)}
            </div>
            <div className="text-green-600 text-xs">India</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-700 font-semibold">
              {formatSalary(domain.averageSalary?.abroad)}
            </div>
            <div className="text-blue-600 text-xs">Abroad</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={`/students/careerdomains/${slug}`}
        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        Explore Domain
      </Link>
    </div>
  );
}
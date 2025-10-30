// app/students/careerdomains/components/DomainCard.tsx
import Link from 'next/link';
import { ICareerDomain } from '@/types/careerDomains';

interface DomainCardProps {
  domain: ICareerDomain;
}

// Helper function to generate slug from domain name
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function DomainCard({ domain }: DomainCardProps) {
  const slug = generateSlug(domain.name);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {domain.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {domain.description}
        </p>
        
        {/* Skills Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Skills:</h4>
          <div className="flex flex-wrap gap-1">
            {domain.skills?.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
            {domain.skills && domain.skills.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                +{domain.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Salary Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Average Salary:</h4>
          <div className="flex justify-between text-sm text-gray-600">
            <span>India: {domain.averageSalary?.india || 'N/A'}</span>
            <span>Abroad: {domain.averageSalary?.abroad || 'N/A'}</span>
          </div>
        </div>

        <Link
          href={`/students/careerdomains/${slug}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
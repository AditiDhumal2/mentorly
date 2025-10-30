// app/students/careerdomains/components/ResourceLink.tsx
interface Resource {
  title: string;
  url: string;
}

interface ResourceLinkProps {
  resources: Resource[];
}

export default function ResourceLink({ resources }: ResourceLinkProps) {
  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No learning resources available for this domain yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">{resource.title}</h4>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {resource.url}
          </a>
        </div>
      ))}
    </div>
  );
}
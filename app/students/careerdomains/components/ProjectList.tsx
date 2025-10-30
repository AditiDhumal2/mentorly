// app/students/careerdomains/components/ProjectList.tsx
interface ProjectListProps {
  projects: string[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="space-y-3">
      {projects?.map((project, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-1">Project {index + 1}</h4>
          <p className="text-gray-700">{project}</p>
        </div>
      ))}
    </div>
  );
}
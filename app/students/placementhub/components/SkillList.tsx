// app/students/placementhub/components/SkillList.tsx

interface SkillListProps {
  skills: string[];
  title: string;
}

export function SkillList({ skills, title }: SkillListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-gray-700 text-sm">{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
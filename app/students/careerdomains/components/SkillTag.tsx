// app/students/careerdomains/components/SkillTag.tsx
interface SkillTagProps {
  skills: string[];
}

export default function SkillTag({ skills }: SkillTagProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills?.map((skill, index) => (
        <span
          key={index}
          className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
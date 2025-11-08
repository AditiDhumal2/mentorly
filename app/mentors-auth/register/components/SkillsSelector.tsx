// app/mentors/mentor-auth/register/components/SkillsSelector.tsx
'use client';

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

const technicalSkills = [
  // Programming Languages
  'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin',
  
  // Web Development
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Django', 'Flask', 'Spring Boot',
  
  // Mobile Development
  'React Native', 'Flutter', 'Android Development', 'iOS Development',
  
  // Data Science & AI
  'Machine Learning', 'Deep Learning', 'Data Science', 'Natural Language Processing', 'Computer Vision',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux',
  
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL',
  
  // Other Technologies
  'Blockchain', 'Cybersecurity', 'UI/UX Design', 'GraphQL', 'REST APIs', 'Microservices'
];

export default function SkillsSelector({ selectedSkills, onSkillsChange }: SkillsSelectorProps) {
  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    onSkillsChange(newSkills);
  };

  const popularSkills = ['Python', 'JavaScript', 'React', 'Machine Learning', 'AWS', 'Node.js'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technical Skills *
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Select the technologies and skills you're proficient in. This helps students find the right mentor.
        </p>
      </div>

      {/* Popular Skills Quick Select */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select Popular Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {popularSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleSkillToggle(skill)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedSkills.includes(skill)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* All Skills Grid */}
      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {technicalSkills.map((skill) => (
            <label
              key={skill}
              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                selectedSkills.includes(skill)
                  ? 'bg-blue-100 border border-blue-300'
                  : 'hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Selected: {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
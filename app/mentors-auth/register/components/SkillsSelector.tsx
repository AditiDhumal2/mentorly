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
    <div className="space-y-6 bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Skills & Education</h2>
        <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
        <p className="text-base text-gray-300">
          Select the technologies and skills you're proficient in. This helps students find the right mentor.
        </p>
      </div>

      {/* Popular Skills Section */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-white">Popular Skills</h4>
        <div className="flex flex-wrap gap-2">
          {popularSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleSkillToggle(skill)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSkills.includes(skill)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* All Skills Grid */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-white">All Skills</h4>
        <div className="max-h-80 overflow-y-auto border border-white/10 rounded-lg p-4 bg-white/5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {technicalSkills.map((skill) => (
              <label
                key={skill}
                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors border ${
                  selectedSkills.includes(skill)
                    ? 'bg-purple-500/20 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="rounded border-gray-500 text-purple-500 focus:ring-purple-500 mr-2 bg-white/10"
                />
                <span className="text-sm">{skill}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Skills Counter */}
      <div className="flex items-center text-sm text-gray-300">
        <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Selected: {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
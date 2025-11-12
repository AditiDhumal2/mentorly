// app/mentors/mentor-auth/register/components/EducationBackground.tsx
'use client';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface EducationBackgroundProps {
  education: Education[];
  onEducationChange: (education: Education[]) => void;
}

export default function EducationBackground({ education, onEducationChange }: EducationBackgroundProps) {
  const addEducation = () => {
    onEducationChange([
      ...education,
      { degree: '', institution: '', year: '' }
    ]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      onEducationChange(education.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    onEducationChange(updatedEducation);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Education Background *</h2>
        <p className="text-base text-gray-300">
          Add your educational qualifications to build credibility with students.
        </p>
      </div>

      {education.map((edu, index) => (
        <div key={index} className="border border-white/10 rounded-lg p-6 bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Degree/Certificate *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., B.Tech Computer Science"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Institution *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., IIT Bombay"
                value={edu.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year of Completion *
              </label>
              <input
                type="number"
                required
                min="1950"
                max={currentYear + 5}
                placeholder="e.g., 2020"
                value={edu.year}
                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          {education.length > 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        className="flex items-center px-4 py-3 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium w-full justify-center border border-white/10"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Education
      </button>
    </div>
  );
}
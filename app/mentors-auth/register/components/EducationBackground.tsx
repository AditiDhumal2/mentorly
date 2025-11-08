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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education Background *
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add your educational qualifications to build credibility with students.
        </p>
      </div>

      {education.map((edu, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree/Certificate *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., B.Tech Computer Science"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., IIT Bombay"
                value={edu.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {education.length > 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
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
        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Education
      </button>
    </div>
  );
}
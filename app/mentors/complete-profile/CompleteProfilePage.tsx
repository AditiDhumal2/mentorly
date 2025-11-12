'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkMentorAuth } from '@/app/mentors-auth/login/actions/mentor-login.actions';
import CategorySelector from '@/app/mentors-auth/register/components/CategorySelector';
import EducationBackground from '@/app/mentors-auth/register/components/EducationBackground';
import SkillsSelector from '@/app/mentors-auth/register/components/SkillsSelector';
import { completeMentorProfile } from './actions/complete-profile.actions';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    college: '',
    expertise: [] as string[],
    experience: '',
    qualification: '',
    bio: '',
    skills: [] as string[],
    education: [{ degree: '', institution: '', year: '' }] as Education[],
    linkedin: '',
    hourlyRate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [mentor, setMentor] = useState<any>(null);
  const router = useRouter();

  const totalSteps = 3;

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await checkMentorAuth();
      if (!auth.isAuthenticated || !auth.mentor) {
        router.push('/mentors-auth/login');
        return;
      }
      setMentor(auth.mentor);
    };
    checkAuth();
  }, [router]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (formData.expertise.length === 0) {
        setError('Please select at least one mentoring category');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.skills.length === 0) {
        setError('Please select at least one technical skill');
        return;
      }
      if (!formData.experience || !formData.qualification || !formData.college) {
        setError('Please fill all required fields');
        return;
      }
    }

    setError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.bio) {
      setError('Please provide a bio/introduction');
      setLoading(false);
      return;
    }

    const profileData = {
      college: formData.college,
      expertise: formData.expertise,
      experience: parseInt(formData.experience) || 0,
      qualification: formData.qualification,
      bio: formData.bio,
      skills: formData.skills,
      education: formData.education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: parseInt(edu.year) || new Date().getFullYear()
      })),
      linkedin: formData.linkedin,
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : 0
    };

    const result = await completeMentorProfile(profileData);

    if (result.error) {
      setError(result.error);
    } else {
      // Redirect to pending approval page or dashboard
      router.push('/mentors/dashboard?message=profile_completed');
    }

    setLoading(false);
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex flex-col items-center ${
              step < currentStep ? 'text-green-400' : 
              step === currentStep ? 'text-purple-400 font-semibold' : 'text-gray-400'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step < currentStep ? 'bg-green-500 text-white' :
              step === currentStep ? 'bg-purple-100 border-2 border-purple-500' :
              'bg-gray-600'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            <span className="text-xs mt-1">
              {step === 1 && 'Expertise'}
              {step === 2 && 'Skills & Education'}
              {step === 3 && 'Review & Submit'}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Profile</span>
          </h1>
          <p className="text-xl text-gray-300">
            Hi {mentor.name}! Complete your profile to start mentoring students.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8">
          <ProgressBar />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Mentoring Categories */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Mentoring Expertise</h2>
                <CategorySelector
                  selectedExpertise={formData.expertise}
                  onExpertiseChange={(expertise: string[]) => updateFormData({ expertise })}
                  error={error.includes('category') ? error : undefined}
                />
              </div>
            )}

            {/* Step 2: Skills & Education */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Skills & Education</h2>
                
                <SkillsSelector
                  selectedSkills={formData.skills}
                  onSkillsChange={(skills: string[]) => updateFormData({ skills })}
                />

                <div className="border-t border-white/10 pt-8">
                  <EducationBackground
                    education={formData.education}
                    onEducationChange={(education: Education[]) => updateFormData({ education })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      College/University *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => updateFormData({ college: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your current or alma mater institution"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) => updateFormData({ experience: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Highest Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => updateFormData({ qualification: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., M.Tech Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => updateFormData({ linkedin: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Review & Submit</h2>
                
                <div className="bg-white/5 rounded-lg p-6 space-y-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white">Profile Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-300">
                      <strong className="text-white">Name:</strong> {mentor.name}
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">Email:</strong> {mentor.email}
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">College:</strong> {formData.college}
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">Experience:</strong> {formData.experience} years
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">Qualification:</strong> {formData.qualification}
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">Expertise Areas:</strong> {formData.expertise.length}
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">Skills:</strong> {formData.skills.length}
                    </div>
                  </div>

                  <div>
                    <strong className="block mb-2 text-white">Selected Expertise:</strong>
                    <div className="flex flex-wrap gap-1">
                      {formData.expertise.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                        >
                          {category.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio/Introduction *
                    </label>
                    <textarea
                      required
                      value={formData.bio}
                      onChange={(e) => updateFormData({ bio: e.target.value })}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Tell students about your background, experience, and how you can help them..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hourly Rate (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="0 (free mentoring)"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Leave as 0 if you want to offer free mentoring sessions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/40"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
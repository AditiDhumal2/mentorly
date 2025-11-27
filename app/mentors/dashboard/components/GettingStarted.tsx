// app/mentors/dashboard/components/GettingStarted.tsx
import Link from 'next/link';

export default function GettingStarted() {
  const steps = [
    {
      number: 1,
      title: 'Complete Your Profile',
      description: 'Add your expertise areas and bio to attract more students',
      link: '/profile',
      linkText: 'Update Profile →',
      color: 'blue'
    },
    {
      number: 2,
      title: 'Set Your Availability',
      description: 'Choose time slots when you\'re available for sessions',
      link: '/mentors/availability',
      linkText: 'Set Availability →',
      color: 'green'
    },
    {
      number: 3,
      title: 'Start Mentoring',
      description: 'Accept session requests and begin guiding students',
      link: '/mentors/sessions',
      linkText: 'View Requests →',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Getting Started</h2>
      <div className="space-y-4">
        {steps.map((step) => {
          const colorClasses = getColorClasses(step.color);
          return (
            <div key={step.number} className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 ${colorClasses.bg} rounded-full flex items-center justify-center mt-1`}>
                <span className={`${colorClasses.text} text-sm font-bold`}>{step.number}</span>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <Link href={step.link} className={`${colorClasses.text} hover:${colorClasses.text.replace('600', '800')} text-sm font-medium mt-2 inline-block`}>
                  {step.linkText}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
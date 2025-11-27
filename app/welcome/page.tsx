// app/welcome/page.tsx
'use client';

import WelcomeHero from './components/WelcomeHero';
import FeatureCard from './components/FeatureCard';
import EngineeringFeatureCard from './components/EngineeringFeatureCard';
import CTAButtons from './components/CTAButtons';
import Footer from './components/Footer';

export default function Welcome() {
  const features = [
    {
      title: "Personalized Roadmaps",
      description: "AI-powered learning paths tailored to your career goals and skill level",
      icon: "🗺️",
      gradient: "from-cyan-500 to-blue-500",
      delay: "0"
    },
    {
      title: "Live Market Trends",
      description: "Real-time industry insights and trending technologies",
      icon: "📊",
      gradient: "from-purple-500 to-pink-500",
      delay: "100"
    },
    {
      title: "Expert Mentorship",
      description: "1:1 guidance from industry professionals and senior engineers",
      icon: "👨‍💼",
      gradient: "from-orange-500 to-red-500",
      delay: "200"
    },
    {
      title: "Placement Preparation",
      description: "Comprehensive interview prep and resume building",
      icon: "🎯",
      gradient: "from-green-500 to-teal-500",
      delay: "300"
    }
  ];

  const engineeringFeatures = [
    {
      title: "Full Stack Development",
      description: "Master modern web development with latest frameworks and tools",
      icon: "💻",
      gradient: "from-blue-500 to-cyan-500",
      delay: "0",
      specs: ["React/Next.js", "Node.js/Express", "MongoDB/PostgreSQL", "AWS/Docker"]
    },
    {
      title: "Data Science & AI",
      description: "Dive into machine learning, data analysis and AI technologies",
      icon: "🤖",
      gradient: "from-purple-500 to-pink-500",
      delay: "100",
      specs: ["Python/Pandas", "TensorFlow/PyTorch", "SQL/NoSQL", "Data Visualization"]
    },
    {
      title: "Cloud & DevOps",
      description: "Learn cloud platforms and modern deployment practices",
      icon: "☁️",
      gradient: "from-orange-500 to-yellow-500",
      delay: "200",
      specs: ["AWS/Azure/GCP", "Kubernetes/Docker", "CI/CD Pipelines", "Infrastructure as Code"]
    },
    {
      title: "Mobile Development",
      description: "Build cross-platform mobile applications",
      icon: "📱",
      gradient: "from-green-500 to-emerald-500",
      delay: "300",
      specs: ["React Native", "Flutter/Dart", "iOS/Android", "App Store Deployment"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="container mx-auto px-4 pt-16">
            <WelcomeHero />
          </div>

          {/* CTA Buttons */}
          <div className="container mx-auto px-4 py-8">
            <CTAButtons />
          </div>

          {/* Engineering Domains Section */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Master In-Demand <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Tech Domains</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose your specialization and get comprehensive learning paths with real-world projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {engineeringFeatures.map((feature, index) => (
                <EngineeringFeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  gradient={feature.gradient}
                  delay={feature.delay}
                  specs={feature.specs}
                />
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Mentorly</span> Works
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We combine cutting-edge technology with proven mentorship methodologies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  gradient={feature.gradient}
                  delay={feature.delay}
                />
              ))}
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Career Journey</span>?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of students who have accelerated their careers with personalized guidance
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/students-auth/register"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25"
                  >
                    🚀 Start Your Journey Free
                  </a>
                  <a
                    href="/students/market-trends"
                    className="border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                  >
                    📊 Explore Market Trends
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

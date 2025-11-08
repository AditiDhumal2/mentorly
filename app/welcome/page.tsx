// app/welcome/page.tsx
import WelcomeHero from './components/WelcomeHero';
import EngineeringFeatureCard from './components/EngineeringFeatureCard';
import CTAButtons from './components/CTAButtons';
import Footer from './components/Footer';

export default function WelcomePage() {
  const engineeringFeatures = [
    {
      title: 'Campus Placement Prep',
      description: 'Ace coding tests, technical interviews, and HR rounds with company-specific preparation',
      icon: '🏛️',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0',
      specs: ['DSA & CP Practice', 'Company-wise Prep', 'Mock Interviews', 'Resume Building']
    },
    {
      title: 'Off-Campus Mastery',
      description: 'Land dream jobs at FAANG and startups with targeted off-campus application strategies',
      icon: '🚀',
      gradient: 'from-purple-500 to-pink-500',
      delay: '100',
      specs: ['Referral Strategies', 'LinkedIn Optimization', 'Portfolio Building', 'Networking Guide']
    },
    {
      title: 'Masters & Higher Studies',
      description: 'Build strong profiles for MS/M.Tech with research projects, SOPs, and university shortlisting',
      icon: '🎓',
      gradient: 'from-green-500 to-teal-500',
      delay: '200',
      specs: ['SOP & LOR Guidance', 'Project Showcase', 'University Shortlist', 'GRE/GATE Prep']
    },
    {
      title: 'Tech Skill Builder',
      description: 'Master in-demand technologies with project-based learning and real-world applications',
      icon: '💻',
      gradient: 'from-orange-500 to-red-500',
      delay: '300',
      specs: ['Web Development', 'AI/ML Projects', 'Cloud & DevOps', 'Open Source']
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col overflow-hidden">
      {/* Circuit Board Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
      </div>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8 pt-20 relative z-10">
        <WelcomeHero />
        
        {/* Engineering Features Section */}
        <section className="my-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Engineering Career Toolkit</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From campus placements to higher studies - everything you need to succeed as an engineering student
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        </section>

        {/* Platform Overview Section */}
        <section className="my-20">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Everything in One Place</h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Discover all the features designed specifically for engineering students and mentors
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl mb-4">🧭</div>
                <h4 className="text-xl font-bold text-white mb-3">Explore Tech Domains</h4>
                <p className="text-gray-300 text-sm">
                  Understand different career paths and master each domain with guided learning
                </p>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl mb-4">📈</div>
                <h4 className="text-xl font-bold text-white mb-3">Market Trends</h4>
                <p className="text-gray-300 text-sm">
                  Stay updated with latest technologies and industry demands
                </p>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl mb-4">👨‍🏫</div>
                <h4 className="text-xl font-bold text-white mb-3">Expert Mentors</h4>
                <p className="text-gray-300 text-sm">
                  Get guidance from experienced professionals and industry experts
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="my-20 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              Start Your Engineering Career Journey Today!
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of engineering students who've cracked top companies and got into dream universities
            </p>
            <CTAButtons />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
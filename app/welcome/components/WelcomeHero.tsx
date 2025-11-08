// app/welcome/components/WelcomeHero.tsx
export default function WelcomeHero() {
  return (
    <section className="text-center py-16 relative">
      {/* Binary Code Animation */}
      <div className="absolute top-10 left-5 text-green-400 text-xs font-mono opacity-30 animate-pulse">
        10101010
      </div>
      <div className="absolute top-32 right-10 text-cyan-400 text-xs font-mono opacity-40 animate-pulse delay-75">
        11001100
      </div>
      <div className="absolute bottom-20 left-20 text-purple-400 text-xs font-mono opacity-50 animate-pulse delay-150">
        11110000
      </div>
      
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Master Your Tech Career
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            Like a Pro Engineer
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          Discover tech domains, learn trending technologies, master professional platforms, 
          and get real-time market insights - everything engineering students need for 
          <span className="text-cyan-300"> campus placements</span>,{' '}
          <span className="text-blue-300">off-campus jobs</span>, and{' '}
          <span className="text-purple-300">higher studies</span>.
        </p>

        {/* Quick Platform Stats */}
        <div className="max-w-3xl mx-auto mb-12 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">6+</div>
              <div className="text-gray-400 text-sm">Tech Domains</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">Live</div>
              <div className="text-gray-400 text-sm">Market Trends</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">4</div>
              <div className="text-gray-400 text-sm">Platform Guides</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-400">50+</div>
              <div className="text-gray-400 text-sm">Expert Mentors</div>
            </div>
          </div>
        </div>

        {/* Quick Role Selection */}
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm mb-4">
            Are you a student looking for guidance or an expert wanting to mentor?
          </p>
        </div>
      </div>
    </section>
  );
}
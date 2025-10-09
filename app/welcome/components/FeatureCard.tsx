interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  delay: string;
}

export default function FeatureCard({ title, description, icon, gradient, delay }: FeatureCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      {/* Content */}
      <div className="relative p-6 z-10">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        
        {/* Hover Arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white">→</span>
          </div>
        </div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
}
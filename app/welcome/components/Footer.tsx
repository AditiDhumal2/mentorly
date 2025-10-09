import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Roadmaps', href: '/roadmaps' },
        { name: 'Career Paths', href: '/careers' },
        { name: 'Resources', href: '/resources' },
        { name: 'Community', href: '/community' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Mentor', href: '/contact' },
        { name: 'Live Chat', href: '/chat' },
        { name: 'FAQs', href: '/faqs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Success Stories', href: '/success' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
      ],
    },
  ];

  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-white/10 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <div className="w-6 h-6 relative">
                  <div className="absolute left-0 top-0 w-1 h-6 bg-white rounded-tl rounded-bl"></div>
                  <div className="absolute left-0 top-0 w-6 h-1 bg-white rounded-tl rounded-tr"></div>
                  <div className="absolute right-0 top-0 w-1 h-6 bg-white rounded-tr rounded-br"></div>
                  <div className="absolute left-2 top-0 w-1 h-4 bg-white transform -skew-x-12"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mentorly</h3>
                <p className="text-cyan-300 text-sm">Your Career Success Partner</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Transforming student journeys into career success stories through AI-powered guidance, 
              personalized roadmaps, and comprehensive placement preparation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-cyan-500 transition-colors duration-200">
                🐦
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-purple-500 transition-colors duration-200">
                💼
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-pink-500 transition-colors duration-200">
                📱
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4 text-lg">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-300 transition-all duration-200 text-sm hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Mentorly. All rights reserved. Crafted with 💙 for student success
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-cyan-300 transition-colors duration-200 text-sm">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-cyan-300 transition-colors duration-200 text-sm">
              Terms
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-cyan-300 transition-colors duration-200 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
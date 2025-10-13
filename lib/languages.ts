export interface Language {
  id: string;
  name: string;
  icon: string;
  youtubePlaylist: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const languages: Language[] = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    youtubePlaylist: 'https://youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS',
    description: 'Great for beginners, data science, and web development',
    difficulty: 'Beginner'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '📜',
    youtubePlaylist: 'https://youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX',
    description: 'Essential for web development, both frontend and backend',
    difficulty: 'Beginner'
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    youtubePlaylist: 'https://youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
    description: 'Enterprise applications, Android development',
    difficulty: 'Intermediate'
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '⚡',
    youtubePlaylist: 'https://youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ',
    description: 'System programming, game development, high-performance applications',
    difficulty: 'Advanced'
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🐹',
    youtubePlaylist: 'https://youtube.com/playlist?list=PLRAV69dS1uWQGDQoBYMZWKjzuhEdOn6S9',
    description: 'Backend development, microservices, cloud applications',
    difficulty: 'Intermediate'
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '🦀',
    youtubePlaylist: 'https://youtube.com/playlist?list=PLai5B987bZ9CoVR-QEIN9foz4QCJ0H2Y8',
    description: 'Systems programming with memory safety',
    difficulty: 'Advanced'
  }
];

export const getLanguageById = (id: string): Language | undefined => {
  return languages.find(lang => lang.id === id);
};
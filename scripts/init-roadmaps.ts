import { connectDB } from '../lib/db';
import { Roadmap } from '../models/Roadmap';

async function initializeRoadmaps() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing roadmaps to avoid duplicates
    await Roadmap.deleteMany({});
    console.log('Cleared existing roadmaps');

    // Create comprehensive roadmap data for all languages and years
    const languages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];
    
    const roadmaps = [];

    for (const language of languages) {
      for (let year = 1; year <= 4; year++) {
        const languageData = getLanguageSpecificData(language, year);
        
        roadmaps.push({
          year: year,
          language: language,
          title: languageData.title,
          description: languageData.description,
          steps: languageData.steps,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await Roadmap.insertMany(roadmaps);
    console.log(`✅ Roadmaps initialized successfully for ${languages.length} languages across 4 years!`);
    
  } catch (error) {
    console.error('❌ Error initializing roadmaps:', error);
  } finally {
    process.exit(0);
  }
}

function getLanguageSpecificData(language: string, year: number) {
  const languageNames: { [key: string]: string } = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    go: 'Go',
    rust: 'Rust'
  };

  const languageData: { [key: string]: any } = {
    python: {
      1: {
        title: 'Python Foundation - Beginner Journey',
        description: 'Start your programming journey with Python, the perfect language for beginners',
        steps: [
          {
            title: 'Python Basics & Syntax',
            description: 'Master Python fundamentals including variables, data types, loops, functions, and basic data structures',
            category: 'fundamentals',
            resources: [
              {
                title: 'Python Full Course for Beginners',
                url: 'https://youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS',
                type: 'video'
              },
              {
                title: 'Python Official Tutorial',
                url: 'https://docs.python.org/3/tutorial/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '3 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a Calculator App',
            description: 'Create a functional calculator with a GUI using Tkinter to practice Python skills',
            category: 'project',
            resources: [
              {
                title: 'Python Calculator Tutorial',
                url: 'https://youtube.com/watch?v=YXPyB4XeYLA',
                type: 'video'
              }
            ],
            estimatedDuration: '1 week',
            priority: 2,
            languageSpecific: true
          }
        ]
      },
      2: {
        title: 'Python Development - Intermediate Skills',
        description: 'Advance your Python skills with web development and data analysis',
        steps: [
          {
            title: 'Web Development with Django',
            description: 'Learn Django framework to build robust web applications',
            category: 'web',
            resources: [
              {
                title: 'Django for Beginners',
                url: 'https://youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS',
                type: 'video'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
            languageSpecific: true
          }
        ]
      }
    },
    javascript: {
      1: {
        title: 'JavaScript Foundation - Web Basics',
        description: 'Learn the language of the web and start building interactive websites',
        steps: [
          {
            title: 'JavaScript Fundamentals',
            description: 'Master JavaScript basics including variables, functions, DOM manipulation, and events',
            category: 'fundamentals',
            resources: [
              {
                title: 'JavaScript Full Course',
                url: 'https://youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX',
                type: 'video'
              },
              {
                title: 'MDN JavaScript Guide',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
                type: 'documentation'
              }
            ],
            estimatedDuration: '3 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a Todo App',
            description: 'Create an interactive todo application with local storage',
            category: 'project',
            resources: [
              {
                title: 'JavaScript Todo App Tutorial',
                url: 'https://youtube.com/watch?v=W7FaYfuwu70',
                type: 'video'
              }
            ],
            estimatedDuration: '2 weeks',
            priority: 2,
            languageSpecific: true
          }
        ]
      }
    },
    java: {
      1: {
        title: 'Java Foundation - Object-Oriented Programming',
        description: 'Master Java and object-oriented programming principles',
        steps: [
          {
            title: 'Java Basics & OOP',
            description: 'Learn Java syntax, classes, objects, inheritance, and polymorphism',
            category: 'fundamentals',
            resources: [
              {
                title: 'Java Full Course for Beginners',
                url: 'https://youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
                type: 'video'
              },
              {
                title: 'Java Official Tutorial',
                url: 'https://docs.oracle.com/javase/tutorial/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a Console Calculator',
            description: 'Create a console-based calculator using OOP principles',
            category: 'project',
            resources: [
              {
                title: 'Java Calculator Tutorial',
                url: 'https://youtube.com/watch?v=ZKFwQFBwQFU',
                type: 'video'
              }
            ],
            estimatedDuration: '2 weeks',
            priority: 2,
            languageSpecific: true
          }
        ]
      }
    }
    // Add similar structures for cpp, go, rust...
  };

  // Default structure for missing language/year combinations
  const defaultData = {
    title: `${languageNames[language]} Year ${year} - Development Path`,
    description: `Continue your ${languageNames[language]} learning journey with advanced concepts and projects`,
    steps: [
      {
        title: `Advanced ${languageNames[language]} Concepts`,
        description: `Explore advanced features and best practices in ${languageNames[language]}`,
        category: 'advanced',
        resources: [
          {
            title: `${languageNames[language]} Advanced Tutorial`,
            url: 'https://youtube.com',
            type: 'video'
          }
        ],
        estimatedDuration: '4 weeks',
        priority: 1,
        languageSpecific: true
      }
    ]
  };

  return languageData[language]?.[year] || defaultData;
}

initializeRoadmaps();
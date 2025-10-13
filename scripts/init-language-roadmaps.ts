// scripts/init-language-roadmaps.ts
import { connectDB } from '../lib/db';
import { Roadmap } from '../models/Roadmap';

async function initializeLanguageRoadmaps() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing roadmaps
    await Roadmap.deleteMany({});
    console.log('Cleared existing roadmaps');

    const languages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];
    let createdCount = 0;

    for (const language of languages) {
      for (let year = 1; year <= 4; year++) {
        try {
          const languageData = getLanguageSpecificData(language, year);
          const roadmap = new Roadmap({
            year,
            language,
            ...languageData,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await roadmap.save();
          createdCount++;
          console.log(`✅ Created roadmap for ${language} year ${year}`);
        } catch (error) {
          // Proper TypeScript error handling
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Failed to create roadmap for ${language} year ${year}:`, errorMessage);
        }
      }
    }

    console.log(`🎉 Successfully created ${createdCount} language-specific roadmaps!`);
    
  } catch (error) {
    // Proper TypeScript error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error initializing roadmaps:', errorMessage);
  } finally {
    process.exit(0);
  }
}

function getLanguageSpecificData(language: string, year: number) {
  const languageData: any = {
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
      },
      3: {
        title: 'Advanced Python Concepts',
        description: 'Dive into advanced Python programming patterns and techniques',
        steps: [
          {
            title: 'Data Science with Python',
            description: 'Master pandas, numpy, and matplotlib for data analysis',
            category: 'data-science',
            resources: [
              {
                title: 'Python Data Science Handbook',
                url: 'https://jakevdp.github.io/PythonDataScienceHandbook/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '6 weeks',
            priority: 1,
            languageSpecific: true
          }
        ]
      },
      4: {
        title: 'Python Mastery & Career Preparation',
        description: 'Master advanced Python concepts and prepare for professional development',
        steps: [
          {
            title: 'System Design & Architecture',
            description: 'Learn to design scalable systems with Python',
            category: 'advanced',
            resources: [
              {
                title: 'System Design Primer',
                url: 'https://github.com/donnemartin/system-design-primer',
                type: 'article'
              }
            ],
            estimatedDuration: '8 weeks',
            priority: 1,
            languageSpecific: false
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
            description: 'Master JavaScript basics including variables, functions, DOM manipulation, and ES6 features',
            category: 'fundamentals',
            resources: [
              {
                title: 'JavaScript Full Course for Beginners',
                url: 'https://youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX',
                type: 'video'
              },
              {
                title: 'MDN JavaScript Guide',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
                type: 'documentation'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a Todo App',
            description: 'Create an interactive todo application with JavaScript and local storage',
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
      },
      2: {
        title: 'Frontend Development - React & Modern JS',
        description: 'Master modern JavaScript frameworks and build dynamic user interfaces',
        steps: [
          {
            title: 'React Fundamentals',
            description: 'Learn React components, state management, and hooks',
            category: 'frontend',
            resources: [
              {
                title: 'React Official Tutorial',
                url: 'https://reactjs.org/tutorial/tutorial.html',
                type: 'tutorial'
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true
          }
        ]
      },
      3: {
        title: 'Full-Stack JavaScript Development',
        description: 'Become a full-stack developer with Node.js and databases',
        steps: [
          {
            title: 'Node.js & Backend Development',
            description: 'Build server-side applications with Node.js and Express',
            category: 'backend',
            resources: [
              {
                title: 'Node.js Full Course',
                url: 'https://youtube.com/watch?v=RLtyhwFtXQA',
                type: 'video'
              }
            ],
            estimatedDuration: '6 weeks',
            priority: 1,
            languageSpecific: true
          }
        ]
      },
      4: {
        title: 'JavaScript Mastery & Advanced Topics',
        description: 'Master advanced JavaScript concepts and prepare for senior roles',
        steps: [
          {
            title: 'Advanced JavaScript Patterns',
            description: 'Learn design patterns and performance optimization',
            category: 'advanced',
            resources: [
              {
                title: 'JavaScript Design Patterns',
                url: 'https://www.patterns.dev/posts/classic-design-patterns/',
                type: 'article'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
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
      },
      2: {
        title: 'Java Development - Intermediate Skills',
        description: 'Advance your Java skills with frameworks and tools',
        steps: [
          {
            title: 'Spring Framework Basics',
            description: 'Learn Spring framework for enterprise Java development',
            category: 'frameworks',
            resources: [
              {
                title: 'Spring Boot Tutorial',
                url: 'https://youtube.com/watch?v=vtPkZShrvXQ',
                type: 'video'
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true
          }
        ]
      }
    },
    cpp: {
      1: {
        title: 'C++ Foundation - Systems Programming',
        description: 'Learn C++ for high-performance applications and systems programming',
        steps: [
          {
            title: 'C++ Basics & Memory Management',
            description: 'Master C++ syntax, pointers, memory management, and object-oriented programming',
            category: 'fundamentals',
            resources: [
              {
                title: 'C++ Full Course for Beginners',
                url: 'https://youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ',
                type: 'video'
              },
              {
                title: 'C++ Reference Guide',
                url: 'https://en.cppreference.com/w/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a Number Guessing Game',
            description: 'Create a console-based number guessing game with user input/output',
            category: 'project',
            resources: [
              {
                title: 'C++ Number Guessing Game Tutorial',
                url: 'https://youtube.com/watch?v=PSP_6A0sTTo',
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
    go: {
      1: {
        title: 'Go Foundation - Concurrent Programming',
        description: 'Learn Go for backend development, microservices, and concurrent applications',
        steps: [
          {
            title: 'Go Basics & Concurrency',
            description: 'Master Go syntax, goroutines, channels, and concurrent programming patterns',
            category: 'fundamentals',
            resources: [
              {
                title: 'Go Full Course for Beginners',
                url: 'https://youtube.com/playlist?list=PLRAV69dS1uWQGDQoBYMZWKjzuhEdOn6S9',
                type: 'video'
              },
              {
                title: 'Go Documentation',
                url: 'https://golang.org/doc/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a CLI Tool',
            description: 'Create a command-line interface tool to practice Go programming',
            category: 'project',
            resources: [
              {
                title: 'Go CLI Tool Tutorial',
                url: 'https://youtube.com/watch?v=5g6oNsExJ-c',
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
    rust: {
      1: {
        title: 'Rust Foundation - Memory Safety',
        description: 'Learn Rust for systems programming with guaranteed memory safety',
        steps: [
          {
            title: 'Rust Basics & Ownership',
            description: 'Master Rust syntax, ownership, borrowing, and memory safety concepts',
            category: 'fundamentals',
            resources: [
              {
                title: 'Rust Full Course for Beginners',
                url: 'https://youtube.com/playlist?list=PLai5B987bZ9CoVR-QEIN9foz4QCJ0H2Y8',
                type: 'video'
              },
              {
                title: 'Rust Book',
                url: 'https://doc.rust-lang.org/book/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true
          },
          {
            title: 'Build a Command Line App',
            description: 'Create a command-line application demonstrating Rust memory safety',
            category: 'project',
            resources: [
              {
                title: 'Rust CLI App Tutorial',
                url: 'https://youtube.com/watch?v=5g6oNsExJ-c',
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
  };

  return languageData[language]?.[year] || {
    title: `${getLanguageName(language)} Year ${year} Roadmap`,
    description: `Your learning path for ${getLanguageName(language)} in year ${year}. Start with fundamentals and build real projects.`,
    steps: [
      {
        title: `Learn ${getLanguageName(language)} Basics`,
        description: `Master fundamental ${getLanguageName(language)} programming concepts including syntax, variables, data types, and control structures.`,
        category: 'fundamentals',
        resources: [
          {
            title: `${getLanguageName(language)} Full Course for Beginners`,
            url: getLanguageTutorialUrl(language),
            type: 'video'
          }
        ],
        estimatedDuration: '3-4 weeks',
        priority: 1,
        languageSpecific: true
      },
      {
        title: 'Build Your First Project',
        description: 'Apply your knowledge by building a simple application or script to solve a real problem.',
        category: 'project',
        resources: [
          {
            title: 'Beginner Project Ideas',
            url: 'https://github.com/MunGell/awesome-for-beginners',
            type: 'article'
          }
        ],
        estimatedDuration: '2 weeks',
        priority: 2,
        languageSpecific: false
      }
    ]
  };
}

function getLanguageName(language: string): string {
  const names: { [key: string]: string } = {
    python: 'Python',
    javascript: 'JavaScript', 
    java: 'Java',
    cpp: 'C++',
    go: 'Go',
    rust: 'Rust'
  };
  return names[language] || language;
}

function getLanguageTutorialUrl(language: string): string {
  const urls: { [key: string]: string } = {
    python: 'https://youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS',
    javascript: 'https://youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX',
    java: 'https://youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
    cpp: 'https://youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ',
    go: 'https://youtube.com/playlist?list=PLRAV69dS1uWQGDQoBYMZWKjzuhEdOn6S9',
    rust: 'https://youtube.com/playlist?list=PLai5B987bZ9CoVR-QEIN9foz4QCJ0H2Y8'
  };
  return urls[language] || 'https://youtube.com';
}

initializeLanguageRoadmaps();
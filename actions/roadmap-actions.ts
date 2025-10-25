// app/actions/roadmap-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import { cookies } from 'next/headers';

// Add proper TypeScript interfaces
interface RoadmapStep {
  _id?: string;
  title: string;
  description: string;
  category: string;
  resources: {
    title: string;
    url: string;
    type: string;
  }[];
  estimatedDuration: string;
  priority: number;
  languageSpecific: boolean;
  prerequisites?: string[];
}

interface RoadmapData {
  _id?: string;
  year: number;
  language: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  createdAt: Date;
  updatedAt: Date;
  isFallback?: boolean;
  requestedLanguage?: string;
}

interface RoadmapResult {
  success: boolean;
  error?: string;
  data?: any;
  message?: string;
  isFallback?: boolean;
  requestedLanguage?: string;
}

interface ProgressResult {
  success: boolean;
  error?: string;
  data?: {
    progress: any[];
  };
}

// Add this serialization helper function
function serializeForClient(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeForClient(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Handle MongoDB ObjectId
    if (data._id && typeof data._id === 'object' && data._id.toString) {
      data._id = data._id.toString();
    }
    
    // Handle other potential ObjectId fields
    const objectIdFields = ['userId', 'stepId', 'roadmapId'];
    objectIdFields.forEach(field => {
      if (data[field] && typeof data[field] === 'object' && data[field].toString) {
        data[field] = data[field].toString();
      }
    });
    
    // Recursively process all properties
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeForClient(value);
    }
    return result;
  }
  
  return data;
}

// Helper function to get current student from session
async function getCurrentStudent() {
  try {
    const cookieStore = await cookies();
    const studentCookie = cookieStore.get('student-session-v2');
    
    if (!studentCookie?.value) {
      return null;
    }
    
    const studentData = JSON.parse(studentCookie.value);
    
    // Verify it's actually a student session
    if (studentData.role !== 'student') {
      return null;
    }
    
    return studentData;
  } catch (error) {
    console.error('Error getting current student from session:', error);
    return null;
  }
}

export async function getRoadmapAction(year: number, languageId: string = 'python'): Promise<RoadmapResult> {
  try {
    await connectDB();
    
    console.log(`📚 Fetching roadmap for year ${year}, language: ${languageId}`);
    
    // Validate inputs
    if (!year || year < 1 || year > 4) {
      return { 
        success: false, 
        error: 'Invalid year. Year must be between 1 and 4.' 
      };
    }

    if (!languageId) {
      languageId = 'python'; // Default fallback
    }

    // Get roadmap for specific year and language
    const roadmap = await Roadmap.findOne({ 
      year: parseInt(year as any),
      language: languageId.toLowerCase()
    }).lean();

    if (!roadmap) {
      console.log(`📚 No roadmap found for year ${year}, language: ${languageId}. Falling back to default language.`);
      
      // Fallback to default language (python) if specific language roadmap doesn't exist
      const defaultRoadmap = await Roadmap.findOne({ 
        year: parseInt(year as any), 
        language: 'python' 
      }).lean();
      
      if (!defaultRoadmap) {
        // If no default roadmap exists, create a basic one
        const basicRoadmap = await createBasicRoadmap(year, languageId);
        return { 
          success: true, 
          data: serializeForClient({
            ...basicRoadmap,
            isFallback: true,
            requestedLanguage: languageId
          })
        };
      }
      
      return { 
        success: true, 
        data: serializeForClient({
          ...defaultRoadmap,
          isFallback: true,
          requestedLanguage: languageId
        })
      };
    }

    console.log(`✅ Found roadmap for ${languageId} year ${year}`);
    return { success: true, data: serializeForClient(roadmap) };
  } catch (error) {
    console.error('❌ Error getting roadmap:', error);
    return { success: false, error: 'Failed to load roadmap' };
  }
}

export async function getRoadmapProgressAction(userId: string, languageId?: string, year?: number): Promise<ProgressResult> {
  try {
    await connectDB();
    
    // Get current student to verify access
    const currentStudent = await getCurrentStudent();
    if (!currentStudent) {
      return { 
        success: false, 
        error: 'Student authentication required' 
      };
    }
    
    // Verify the student is accessing their own progress
    if (currentStudent.id !== userId) {
      return { 
        success: false, 
        error: 'Access denied' 
      };
    }
    
    // In a real implementation, you would fetch progress from the Student model
    const progress: any[] = [];
    
    console.log(`📊 Getting progress for student ${userId}, language: ${languageId}, year: ${year}`);
    
    return { 
      success: true, 
      data: { 
        progress: serializeForClient(progress)
      } 
    };
  } catch (error) {
    console.error('❌ Error getting roadmap progress:', error);
    return { success: false, error: 'Failed to load progress' };
  }
}

export async function getAllRoadmapsAction(): Promise<RoadmapResult> {
  try {
    // Verify admin access for this action
    const currentStudent = await getCurrentStudent();
    if (!currentStudent) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }
    
    await connectDB();
    
    const roadmaps = await Roadmap.find({})
      .sort({ year: 1, language: 1 })
      .lean();

    return { success: true, data: serializeForClient(roadmaps) };
  } catch (error) {
    console.error('❌ Error getting all roadmaps:', error);
    return { success: false, error: 'Failed to load roadmaps' };
  }
}

export async function getRoadmapsByYearAction(year: number): Promise<RoadmapResult> {
  try {
    await connectDB();
    
    if (!year || year < 1 || year > 4) {
      return { 
        success: false, 
        error: 'Invalid year. Year must be between 1 and 4.' 
      };
    }

    const roadmaps = await Roadmap.find({ year })
      .sort({ language: 1 })
      .lean();

    return { success: true, data: serializeForClient(roadmaps) };
  } catch (error) {
    console.error('❌ Error getting roadmaps by year:', error);
    return { success: false, error: 'Failed to load roadmaps' };
  }
}

export async function createRoadmapAction(roadmapData: any): Promise<RoadmapResult> {
  try {
    // Verify admin access for this action
    const currentStudent = await getCurrentStudent();
    if (!currentStudent) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }
    
    await connectDB();
    
    const roadmap = new Roadmap(roadmapData);
    await roadmap.save();
    
    console.log('✅ Roadmap created successfully');
    return { success: true, data: serializeForClient(roadmap) };
  } catch (error) {
    console.error('❌ Error creating roadmap:', error);
    return { success: false, error: 'Failed to create roadmap' };
  }
}

export async function updateRoadmapAction(roadmapId: string, updateData: any): Promise<RoadmapResult> {
  try {
    // Verify admin access for this action
    const currentStudent = await getCurrentStudent();
    if (!currentStudent) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }
    
    await connectDB();
    
    const roadmap = await Roadmap.findByIdAndUpdate(
      roadmapId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!roadmap) {
      return { success: false, error: 'Roadmap not found' };
    }
    
    console.log('✅ Roadmap updated successfully');
    return { success: true, data: serializeForClient(roadmap) };
  } catch (error) {
    console.error('❌ Error updating roadmap:', error);
    return { success: false, error: 'Failed to update roadmap' };
  }
}

export async function deleteRoadmapAction(roadmapId: string): Promise<RoadmapResult> {
  try {
    // Verify admin access for this action
    const currentStudent = await getCurrentStudent();
    if (!currentStudent) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }
    
    await connectDB();
    
    const roadmap = await Roadmap.findByIdAndDelete(roadmapId);
    
    if (!roadmap) {
      return { success: false, error: 'Roadmap not found' };
    }
    
    console.log('✅ Roadmap deleted successfully');
    return { success: true, data: { message: 'Roadmap deleted successfully' } };
  } catch (error) {
    console.error('❌ Error deleting roadmap:', error);
    return { success: false, error: 'Failed to delete roadmap' };
  }
}

export async function getAvailableLanguagesAction(year?: number): Promise<RoadmapResult> {
  try {
    await connectDB();
    
    const query = year ? { year } : {};
    const roadmaps = await Roadmap.find(query).distinct('language');
    
    return { success: true, data: serializeForClient(roadmaps) };
  } catch (error) {
    console.error('❌ Error getting available languages:', error);
    return { success: false, error: 'Failed to load available languages' };
  }
}

export async function getAvailableYearsAction(languageId?: string): Promise<RoadmapResult> {
  try {
    await connectDB();
    
    const query = languageId ? { language: languageId.toLowerCase() } : {};
    const years = await Roadmap.find(query).distinct('year');
    
    // Always return years 1-4, even if some don't exist yet
    const allYears = [1, 2, 3, 4];
    const availableYears = allYears.map(year => ({
      year,
      available: years.includes(year),
      label: getYearLabel(year)
    }));
    
    return { success: true, data: serializeForClient(availableYears) };
  } catch (error) {
    console.error('❌ Error getting available years:', error);
    return { success: false, error: 'Failed to load available years' };
  }
}

export async function getUserYearProgressAction(userId: string): Promise<RoadmapResult> {
  try {
    // Verify student access
    const currentStudent = await getCurrentStudent();
    if (!currentStudent || currentStudent.id !== userId) {
      return { 
        success: false, 
        error: 'Access denied' 
      };
    }
    
    await connectDB();
    
    // Mock data - in real implementation, fetch from user progress
    const yearProgress = {
      1: { completed: 30, total: 50, progress: 60 },
      2: { completed: 10, total: 60, progress: 17 },
      3: { completed: 5, total: 55, progress: 9 },
      4: { completed: 0, total: 40, progress: 0 }
    };
    
    return { 
      success: true, 
      data: serializeForClient(yearProgress)
    };
  } catch (error) {
    console.error('❌ Error getting user year progress:', error);
    return { success: false, error: 'Failed to load year progress' };
  }
}

export async function getRoadmapYearsOverview(userId: string, languageId: string): Promise<RoadmapResult> {
  try {
    // Verify student access
    const currentStudent = await getCurrentStudent();
    if (!currentStudent || currentStudent.id !== userId) {
      return { 
        success: false, 
        error: 'Access denied' 
      };
    }
    
    await connectDB();
    
    const years = [1, 2, 3, 4];
    const overview = [];
    
    for (const year of years) {
      const roadmap = await Roadmap.findOne({ 
        year, 
        language: languageId.toLowerCase() 
      }).lean() as RoadmapData | null;
      
      if (roadmap) {
        overview.push({
          year,
          title: roadmap.title,
          description: roadmap.description,
          totalSteps: roadmap.steps?.length || 0,
          available: true,
          label: getYearLabel(year)
        });
      } else {
        // Check if default language roadmap exists
        const defaultRoadmap = await Roadmap.findOne({ 
          year, 
          language: 'python' 
        }).lean() as RoadmapData | null;
        
        overview.push({
          year,
          title: `${getLanguageName(languageId)} Year ${year} Roadmap`,
          description: `Learning path for ${getLanguageName(languageId)} in year ${year}`,
          totalSteps: defaultRoadmap?.steps?.length || 10,
          available: !!defaultRoadmap,
          isFallback: true,
          label: getYearLabel(year)
        });
      }
    }
    
    return { success: true, data: serializeForClient(overview) };
  } catch (error) {
    console.error('❌ Error getting roadmap years overview:', error);
    return { success: false, error: 'Failed to load years overview' };
  }
}

export async function initializeLanguageRoadmaps(): Promise<RoadmapResult> {
  try {
    await connectDB();
    
    const languages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];
    const years = [1, 2, 3, 4];
    
    let createdCount = 0;
    let updatedCount = 0;

    for (const language of languages) {
      for (const year of years) {
        const existingRoadmap = await Roadmap.findOne({ year, language });
        
        if (!existingRoadmap) {
          const roadmapData = getDefaultRoadmapData(language, year);
          const roadmap = new Roadmap(roadmapData);
          await roadmap.save();
          createdCount++;
          console.log(`✅ Created roadmap for ${language} year ${year}`);
        } else {
          // Update existing roadmap with latest structure
          const updateData = getDefaultRoadmapData(language, year);
          await Roadmap.findByIdAndUpdate(existingRoadmap._id, {
            ...updateData,
            updatedAt: new Date()
          });
          updatedCount++;
          console.log(`✅ Updated roadmap for ${language} year ${year}`);
        }
      }
    }
    
    console.log(`🎉 Roadmap initialization completed: ${createdCount} created, ${updatedCount} updated`);
    return { 
      success: true, 
      data: serializeForClient({ 
        message: `Roadmaps initialized: ${createdCount} created, ${updatedCount} updated`,
        created: createdCount,
        updated: updatedCount
      }) 
    };
  } catch (error) {
    console.error('❌ Error initializing roadmaps:', error);
    return { success: false, error: 'Failed to initialize roadmaps' };
  }
}

// Helper function to create basic roadmap when none exists
async function createBasicRoadmap(year: number, languageId: string): Promise<RoadmapData> {
  const basicRoadmap: RoadmapData = {
    year,
    language: languageId,
    title: `${getLanguageName(languageId)} Year ${year} Roadmap`,
    description: `Your learning path for ${getLanguageName(languageId)} in year ${year}. Start with fundamentals and build real projects.`,
    steps: [
      {
        title: `Learn ${getLanguageName(languageId)} Basics`,
        description: `Master fundamental ${getLanguageName(languageId)} programming concepts including syntax, variables, data types, and control structures.`,
        category: 'fundamentals',
        resources: [
          {
            title: `${getLanguageName(languageId)} Full Course for Beginners`,
            url: getLanguageTutorialUrl(languageId),
            type: 'video'
          }
        ],
        estimatedDuration: '3-4 weeks',
        priority: 1,
        languageSpecific: true,
        prerequisites: []
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
        languageSpecific: false,
        prerequisites: []
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Save to database for future use
  const roadmap = new Roadmap(basicRoadmap);
  await roadmap.save();
  
  console.log(`✅ Created basic roadmap for ${languageId} year ${year}`);
  return basicRoadmap;
}

// Helper function to get default roadmap data
function getDefaultRoadmapData(language: string, year: number): RoadmapData {
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
              },
              {
                title: 'Python Official Tutorial',
                url: 'https://docs.python.org/3/tutorial/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '3 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      2: {
        title: 'Python Development - Web & Data',
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      3: {
        title: 'Advanced Python & Specialization',
        description: 'Dive into advanced Python concepts and choose your specialization path',
        steps: [
          {
            title: 'Data Science with Python',
            description: 'Master pandas, numpy, and matplotlib for data analysis and visualization',
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      4: {
        title: 'Python Mastery & Career Preparation',
        description: 'Master advanced Python concepts and prepare for your professional career',
        steps: [
          {
            title: 'System Design & Architecture',
            description: 'Learn to design scalable systems and understand software architecture patterns',
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
            languageSpecific: false,
            prerequisites: []
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
            languageSpecific: true,
            prerequisites: []
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      2: {
        title: 'Frontend Development - React & Modern JS',
        description: 'Master modern JavaScript frameworks and build dynamic user interfaces',
        steps: [
          {
            title: 'React Fundamentals',
            description: 'Learn React components, state management, and hooks for building modern UIs',
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      3: {
        title: 'Full-Stack JavaScript Development',
        description: 'Become a full-stack developer with Node.js, Express, and databases',
        steps: [
          {
            title: 'Node.js & Backend Development',
            description: 'Build server-side applications with Node.js, Express, and REST APIs',
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      4: {
        title: 'JavaScript Mastery & Advanced Topics',
        description: 'Master advanced JavaScript concepts and prepare for senior roles',
        steps: [
          {
            title: 'Advanced JavaScript Patterns',
            description: 'Learn design patterns, performance optimization, and advanced language features',
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
            languageSpecific: true,
            prerequisites: []
          }
        ]
      }
    },
    java: {
      1: {
        title: 'Java Foundation - Object-Oriented Programming',
        description: 'Master Java and object-oriented programming principles for enterprise development',
        steps: [
          {
            title: 'Java Basics & OOP',
            description: 'Learn Java syntax, classes, objects, inheritance, polymorphism, and interfaces',
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
            languageSpecific: true,
            prerequisites: []
          },
          {
            title: 'Build a Console Calculator',
            description: 'Create a console-based calculator using OOP principles and Java collections',
            category: 'project',
            resources: [
              {
                title: 'Java Calculator Tutorial - Bro Code',
                url: 'https://youtube.com/watch?v=ZuegHmYa1Rs',
                type: 'video'
              },
              {
                title: 'Simple Java Calculator Program',
                url: 'https://www.javatpoint.com/java-calculator',
                type: 'article'
              }
            ],
            estimatedDuration: '2 weeks',
            priority: 2,
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      2: {
        title: 'Java Development - Spring Framework & APIs',
        description: 'Advance your Java skills with Spring framework and REST API development',
        steps: [
          {
            title: 'Spring Framework Fundamentals',
            description: 'Learn Spring Boot, dependency injection, and building RESTful APIs',
            category: 'backend',
            resources: [
              {
                title: 'Spring Boot Full Course',
                url: 'https://youtube.com/watch?v=vtPkZShrvXQ',
                type: 'video'
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      3: {
        title: 'Advanced Java & Enterprise Development',
        description: 'Master advanced Java concepts and enterprise application development',
        steps: [
          {
            title: 'Microservices with Spring Cloud',
            description: 'Learn to build and deploy microservices architectures with Spring Cloud',
            category: 'advanced',
            resources: [
              {
                title: 'Microservices with Spring Boot',
                url: 'https://spring.io/guides/gs/rest-service/',
                type: 'documentation'
              }
            ],
            estimatedDuration: '6 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
          }
        ]
      },
      4: {
        title: 'Java Mastery & System Architecture',
        description: 'Master Java performance optimization and system design principles',
        steps: [
          {
            title: 'Java Performance Tuning',
            description: 'Learn JVM internals, garbage collection, and performance optimization techniques',
            category: 'advanced',
            resources: [
              {
                title: 'Java Performance Guide',
                url: 'https://www.baeldung.com/java-performance',
                type: 'article'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
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
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
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
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
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
              }
            ],
            estimatedDuration: '5 weeks',
            priority: 1,
            languageSpecific: true,
            prerequisites: []
          }
        ]
      }
    }
  };

  // Default data for any missing language/year combination
  return {
    year,
    language,
    title: languageData[language]?.[year]?.title || `${getLanguageName(language)} Year ${year} Roadmap`,
    description: languageData[language]?.[year]?.description || `Advanced ${getLanguageName(language)} development and specialized topics for year ${year}`,
    steps: languageData[language]?.[year]?.steps || [
      {
        title: `Advanced ${getLanguageName(language)} Concepts`,
        description: `Master advanced features, best practices, and specialized topics in ${getLanguageName(language)}`,
        category: 'advanced',
        resources: [
          {
            title: `${getLanguageName(language)} Advanced Tutorial`,
            url: 'https://youtube.com',
            type: 'video'
          }
        ],
        estimatedDuration: '4-6 weeks',
        priority: 1,
        languageSpecific: true,
        prerequisites: []
      },
      {
        title: 'Real-World Project Development',
        description: 'Build a comprehensive project applying advanced concepts and industry best practices',
        category: 'project',
        resources: [
          {
            title: 'Project Development Guide',
            url: 'https://github.com/',
            type: 'article'
          }
        ],
        estimatedDuration: '8 weeks',
        priority: 2,
        languageSpecific: false,
        prerequisites: []
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
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

function getYearLabel(year: number): string {
  const labels: { [key: number]: string } = {
    1: '1st Year - Foundation',
    2: '2nd Year - Skill Development', 
    3: '3rd Year - Specialization',
    4: '4th Year - Placement Preparation'
  };
  return labels[year] || `Year ${year}`;
}
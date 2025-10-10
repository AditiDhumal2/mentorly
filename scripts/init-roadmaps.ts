import { connectDB } from '../lib/db';
import { Roadmap } from '../models/Roadmap';

async function initializeRoadmaps() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if roadmaps already exist
    const existingRoadmaps = await Roadmap.countDocuments();
    if (existingRoadmaps > 0) {
      console.log('Roadmaps already exist, skipping initialization');
      return;
    }

    // Create sample roadmap data for all 4 years
    const roadmaps = [
      {
        year: 1,
        title: 'Foundation Year - Building Core Skills',
        description: 'Establish strong fundamentals in programming, mathematics, and computer science concepts',
        steps: [
          {
            title: 'Learn Python Basics',
            description: 'Master fundamental Python programming concepts including variables, data types, loops, and functions',
            category: 'skill',
            resources: [
              {
                title: 'Python for Beginners',
                url: 'https://www.learnpython.org/',
                type: 'tutorial'
              }
            ],
            estimatedDuration: '3 weeks',
            priority: 1
          },
          {
            title: 'Build a Simple Calculator',
            description: 'Create a basic calculator application to practice your Python skills',
            category: 'project',
            resources: [
              {
                title: 'Calculator Project Guide',
                url: 'https://www.geeksforgeeks.org/python-simple-calculator/',
                type: 'article'
              }
            ],
            estimatedDuration: '1 week',
            priority: 2
          },
          {
            title: 'Set up GitHub Account',
            description: 'Create a GitHub account and learn basic Git commands',
            category: 'profile',
            resources: [
              {
                title: 'GitHub Getting Started',
                url: 'https://docs.github.com/en/get-started',
                type: 'tutorial'
              }
            ],
            estimatedDuration: '1 week',
            priority: 3
          }
        ]
      },
      {
        year: 2,
        title: 'Skill Development Year',
        description: 'Build upon your foundation with advanced programming concepts and web development',
        steps: [
          {
            title: 'Learn Web Development Basics',
            description: 'Master HTML, CSS, and JavaScript fundamentals',
            category: 'skill',
            resources: [
              {
                title: 'Web Development Course',
                url: 'https://www.freecodecamp.org/learn/',
                type: 'course'
              }
            ],
            estimatedDuration: '4 weeks',
            priority: 1
          },
          {
            title: 'Build a Portfolio Website',
            description: 'Create a personal portfolio website to showcase your projects',
            category: 'project',
            resources: [
              {
                title: 'Portfolio Website Guide',
                url: 'https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio/',
                type: 'article'
              }
            ],
            estimatedDuration: '2 weeks',
            priority: 2
          }
        ]
      },
      {
        year: 3,
        title: 'Specialization Year',
        description: 'Dive deeper into your chosen specialization and build complex projects',
        steps: [
          {
            title: 'Choose Your Specialization',
            description: 'Explore different career paths and choose your area of focus',
            category: 'career',
            resources: [
              {
                title: 'Career Path Guide',
                url: 'https://www.coursera.org/articles/career-paths',
                type: 'guide'
              }
            ],
            estimatedDuration: '2 weeks',
            priority: 1
          },
          {
            title: 'Build a Full-Stack Application',
            description: 'Create a complete web application with frontend and backend',
            category: 'project',
            resources: [
              {
                title: 'Full-Stack Tutorial',
                url: 'https://www.freecodecamp.org/news/full-stack-web-development/',
                type: 'tutorial'
              }
            ],
            estimatedDuration: '6 weeks',
            priority: 2
          }
        ]
      },
      {
        year: 4,
        title: 'Placement Preparation Year',
        description: 'Prepare for internships and job placements with intensive practice',
        steps: [
          {
            title: 'Data Structures & Algorithms',
            description: 'Master DSA concepts for technical interviews',
            category: 'skill',
            resources: [
              {
                title: 'DSA Crash Course',
                url: 'https://www.geeksforgeeks.org/data-structures/',
                type: 'course'
              }
            ],
            estimatedDuration: '6 weeks',
            priority: 1
          },
          {
            title: 'Practice Coding Problems',
            description: 'Solve problems on platforms like LeetCode and HackerRank',
            category: 'skill',
            resources: [
              {
                title: 'LeetCode',
                url: 'https://leetcode.com/',
                type: 'platform'
              }
            ],
            estimatedDuration: '8 weeks',
            priority: 2
          }
        ]
      }
    ];

    await Roadmap.insertMany(roadmaps);
    console.log('✅ Roadmaps initialized successfully for all 4 years!');
    
  } catch (error) {
    console.error('❌ Error initializing roadmaps:', error);
  } finally {
    process.exit(0);
  }
}

initializeRoadmaps();
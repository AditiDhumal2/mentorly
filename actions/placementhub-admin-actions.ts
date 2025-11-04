// actions/placementhub-admin-actions.ts

'use server';

import { connectDB } from '@/lib/db';
import PlacementHub from '@/models/PlacementHub';
import { revalidatePath } from 'next/cache';
import { ResumeTemplate, CodingProblem, Contest, InterviewTip } from '@/types/placementhub';

// Define the MongoDB document type
interface MongoPlacementHub {
  _id: any;
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  toolsAndPractice: {
    mockInterviewPortal: string;
    resumeTemplates: ResumeTemplate[];
    topCodingProblems: CodingProblem[];
    contestCalendar: Contest[];
  };
  interviewTips: InterviewTip[];
  updatedAt: Date;
  __v?: number;
}

export async function getPlacementHubDataForAdmin() {
  try {
    console.log('🔍 getPlacementHubDataForAdmin - Fetching placement hub data...');
    
    await connectDB();
    
    const placementData = await PlacementHub.findOne().sort({ updatedAt: -1 }).lean() as MongoPlacementHub | null;
    
    if (!placementData) {
      console.log('❌ getPlacementHubDataForAdmin - No placement hub data found');
      return null;
    }

    console.log('✅ getPlacementHubDataForAdmin - Successfully fetched placement data');
    
    // Convert to plain object with proper serialization
    const formattedData = {
      _id: placementData._id?.toString() || 'unknown',
      mustHaveSkills: placementData.mustHaveSkills || [],
      goodToHaveSkills: placementData.goodToHaveSkills || [],
      toolsAndPractice: {
        mockInterviewPortal: placementData.toolsAndPractice?.mockInterviewPortal || '',
        resumeTemplates: (placementData.toolsAndPractice?.resumeTemplates || []).map(template => ({
          title: template.title,
          url: template.url,
          type: template.type,
          source: template.source,
          description: template.description
        })),
        topCodingProblems: (placementData.toolsAndPractice?.topCodingProblems || []).map(problem => ({
          title: problem.title,
          platform: problem.platform,
          url: problem.url
        })),
        contestCalendar: (placementData.toolsAndPractice?.contestCalendar || []).map(contest => ({
          name: contest.name,
          date: contest.date,
          platform: contest.platform
        }))
      },
      interviewTips: (placementData.interviewTips || []).map(tip => ({
        title: tip.title,
        description: tip.description
      })),
      updatedAt: new Date(placementData.updatedAt || new Date())
    };

    return formattedData;
  } catch (error) {
    console.error('❌ getPlacementHubDataForAdmin - Error:', error);
    throw new Error('Failed to fetch placement hub data');
  }
}

export async function updateSkills(mustHaveSkills: string[], goodToHaveSkills: string[]) {
  try {
    console.log('🔍 updateSkills - Updating skills...');
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      { 
        mustHaveSkills,
        goodToHaveSkills,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    console.log('✅ updateSkills - Skills updated successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { 
      success: true, 
      message: 'Skills updated successfully'
    };
  } catch (error) {
    console.error('❌ updateSkills - Error:', error);
    throw new Error('Failed to update skills');
  }
}

export async function updateMockInterviewPortal(url: string) {
  try {
    console.log('🔍 updateMockInterviewPortal - Updating portal URL...');
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      { 
        'toolsAndPractice.mockInterviewPortal': url,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    console.log('✅ updateMockInterviewPortal - Portal URL updated successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { 
      success: true, 
      message: 'Mock interview portal updated successfully'
    };
  } catch (error) {
    console.error('❌ updateMockInterviewPortal - Error:', error);
    throw new Error('Failed to update mock interview portal');
  }
}

export async function addResumeTemplate(template: Omit<ResumeTemplate, 'id'>) {
  try {
    console.log('🔍 addResumeTemplate - Adding new template:', template);
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      {
        $push: {
          'toolsAndPractice.resumeTemplates': template
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ addResumeTemplate - Template added successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Resume template added successfully' };
  } catch (error) {
    console.error('❌ addResumeTemplate - Error:', error);
    throw new Error('Failed to add resume template');
  }
}

export async function updateResumeTemplate(index: number, template: ResumeTemplate) {
  try {
    console.log('🔍 updateResumeTemplate - Updating template at index:', index);
    
    await connectDB();
    
    const key = `toolsAndPractice.resumeTemplates.${index}`;
    const updateData: any = { updatedAt: new Date() };
    updateData[key] = template;
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true }
    );

    console.log('✅ updateResumeTemplate - Template updated successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Resume template updated successfully' };
  } catch (error) {
    console.error('❌ updateResumeTemplate - Error:', error);
    throw new Error('Failed to update resume template');
  }
}

export async function deleteResumeTemplate(index: number) {
  try {
    console.log('🔍 deleteResumeTemplate - Deleting template at index:', index);
    
    await connectDB();
    
    // Get current data
    const currentData = await PlacementHub.findOne().lean() as MongoPlacementHub | null;
    
    if (!currentData || !currentData.toolsAndPractice || !currentData.toolsAndPractice.resumeTemplates) {
      throw new Error('No resume templates found');
    }

    // Remove the template at the specified index
    const updatedTemplates = currentData.toolsAndPractice.resumeTemplates.filter((_, i) => i !== index);
    
    await PlacementHub.findOneAndUpdate(
      {},
      {
        'toolsAndPractice.resumeTemplates': updatedTemplates,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ deleteResumeTemplate - Template deleted successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Resume template deleted successfully' };
  } catch (error) {
    console.error('❌ deleteResumeTemplate - Error:', error);
    throw new Error('Failed to delete resume template');
  }
}

export async function addCodingProblem(problem: CodingProblem) {
  try {
    console.log('🔍 addCodingProblem - Adding new problem:', problem);
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      {
        $push: {
          'toolsAndPractice.topCodingProblems': problem
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ addCodingProblem - Problem added successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Coding problem added successfully' };
  } catch (error) {
    console.error('❌ addCodingProblem - Error:', error);
    throw new Error('Failed to add coding problem');
  }
}

export async function deleteCodingProblem(index: number) {
  try {
    console.log('🔍 deleteCodingProblem - Deleting problem at index:', index);
    
    await connectDB();
    
    // Get current data
    const currentData = await PlacementHub.findOne().lean() as MongoPlacementHub | null;
    
    if (!currentData || !currentData.toolsAndPractice || !currentData.toolsAndPractice.topCodingProblems) {
      throw new Error('No coding problems found');
    }

    // Remove the problem at the specified index
    const updatedProblems = currentData.toolsAndPractice.topCodingProblems.filter((_, i) => i !== index);
    
    await PlacementHub.findOneAndUpdate(
      {},
      {
        'toolsAndPractice.topCodingProblems': updatedProblems,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ deleteCodingProblem - Problem deleted successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Coding problem deleted successfully' };
  } catch (error) {
    console.error('❌ deleteCodingProblem - Error:', error);
    throw new Error('Failed to delete coding problem');
  }
}

export async function addContest(contest: Contest) {
  try {
    console.log('🔍 addContest - Adding new contest:', contest);
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      {
        $push: {
          'toolsAndPractice.contestCalendar': contest
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ addContest - Contest added successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Contest added successfully' };
  } catch (error) {
    console.error('❌ addContest - Error:', error);
    throw new Error('Failed to add contest');
  }
}

export async function deleteContest(index: number) {
  try {
    console.log('🔍 deleteContest - Deleting contest at index:', index);
    
    await connectDB();
    
    // Get current data
    const currentData = await PlacementHub.findOne().lean() as MongoPlacementHub | null;
    
    if (!currentData || !currentData.toolsAndPractice || !currentData.toolsAndPractice.contestCalendar) {
      throw new Error('No contests found');
    }

    // Remove the contest at the specified index
    const updatedContests = currentData.toolsAndPractice.contestCalendar.filter((_, i) => i !== index);
    
    await PlacementHub.findOneAndUpdate(
      {},
      {
        'toolsAndPractice.contestCalendar': updatedContests,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ deleteContest - Contest deleted successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Contest deleted successfully' };
  } catch (error) {
    console.error('❌ deleteContest - Error:', error);
    throw new Error('Failed to delete contest');
  }
}

export async function addInterviewTip(tip: InterviewTip) {
  try {
    console.log('🔍 addInterviewTip - Adding new interview tip:', tip);
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      {
        $push: {
          interviewTips: tip
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ addInterviewTip - Interview tip added successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Interview tip added successfully' };
  } catch (error) {
    console.error('❌ addInterviewTip - Error:', error);
    throw new Error('Failed to add interview tip');
  }
}

export async function deleteInterviewTip(index: number) {
  try {
    console.log('🔍 deleteInterviewTip - Deleting interview tip at index:', index);
    
    await connectDB();
    
    // Get current data
    const currentData = await PlacementHub.findOne().lean() as MongoPlacementHub | null;
    
    if (!currentData || !currentData.interviewTips) {
      throw new Error('No interview tips found');
    }

    // Remove the tip at the specified index
    const updatedTips = currentData.interviewTips.filter((_, i) => i !== index);
    
    await PlacementHub.findOneAndUpdate(
      {},
      {
        interviewTips: updatedTips,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ deleteInterviewTip - Interview tip deleted successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Interview tip deleted successfully' };
  } catch (error) {
    console.error('❌ deleteInterviewTip - Error:', error);
    throw new Error('Failed to delete interview tip');
  }
}

// Helper function for default data
async function getDefaultPlacementData() {
  return {
    mustHaveSkills: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming', 
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
      'System Design',
      'Problem Solving',
      'Software Development Lifecycle'
    ],
    goodToHaveSkills: [
      'Web Development (React/Node.js)',
      'Machine Learning & AI',
      'Cloud Computing (AWS/Azure/GCP)',
      'DevOps & CI/CD',
      'Mobile Development',
      'Python Programming',
      'JavaScript/TypeScript',
      'Containerization (Docker/Kubernetes)',
      'Agile Methodology'
    ],
    toolsAndPractice: {
      mockInterviewPortal: 'https://pramp.com',
      resumeTemplates: [
        {
          title: 'Google Docs Resume Template',
          url: 'https://docs.google.com/document/u/0/?ftv=1&tgif=c',
          type: 'external' as const,
          source: 'Google Docs',
          description: 'Free, editable templates directly in Google Docs - most reliable option'
        },
        {
          title: 'Canva Modern Resume',
          url: 'https://www.canva.com/resumes/templates/',
          type: 'external' as const,
          source: 'Canva',
          description: 'Beautiful, customizable resume templates with drag-and-drop editor'
        },
        {
          title: 'Microsoft Office Templates',
          url: 'https://templates.office.com/en-us/resumes-and-cover-letters',
          type: 'external' as const,
          source: 'Microsoft Office',
          description: 'Professional templates for Word, PowerPoint, and Excel'
        },
        {
          title: 'Resume.io Templates',
          url: 'https://resume.io/resume-templates',
          type: 'external' as const,
          source: 'Resume.io',
          description: 'Professional templates with easy online editor and ATS optimization'
        },
        {
          title: 'NovoResume Templates',
          url: 'https://novoresume.com/resume-templates',
          type: 'external' as const,
          source: 'NovoResume',
          description: 'Modern templates specifically designed for job applications'
        }
      ],
      topCodingProblems: [
        { title: 'Two Sum', platform: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/' },
        { title: 'Reverse Linked List', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/' },
        { title: 'Valid Parentheses', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/' },
        { title: 'Merge Intervals', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/' },
        { title: 'Maximum Subarray', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-subarray/' },
        { title: 'Product of Array Except Self', platform: 'LeetCode', url: 'https://leetcode.com/problems/product-of-array-except-self/' }
      ],
      contestCalendar: [
        { name: 'Google Code Jam', date: new Date('2024-03-15'), platform: 'Google' },
        { name: 'Facebook Hacker Cup', date: new Date('2024-04-01'), platform: 'Meta' },
        { name: 'Google Kick Start', date: new Date('2024-02-25'), platform: 'Google' },
        { name: 'LeetCode Weekly Contest', date: new Date('2024-01-28'), platform: 'LeetCode' }
      ]
    },
    interviewTips: [
      { 
        title: 'Behavioral Questions Preparation', 
        description: 'Prepare STAR method (Situation, Task, Action, Result) for behavioral questions. Practice common questions about teamwork, leadership, challenges, and achievements.' 
      },
      { 
        title: 'Technical Interview Strategy', 
        description: 'Practice whiteboarding and explaining your thought process. Start with brute force solutions, then optimize. Always communicate your approach clearly and ask clarifying questions.' 
      },
      { 
        title: 'System Design Fundamentals', 
        description: 'For senior roles, practice designing scalable systems. Start with requirements gathering, then data models, API design, database schema, and scalability considerations.' 
      },
      { 
        title: 'Resume Optimization', 
        description: 'Tailor your resume for each company. Use action verbs and quantify achievements. Keep it to one page for early career roles. Highlight relevant projects and technologies.' 
      }
    ]
  };
}

export async function initializePlacementHubData() {
  try {
    console.log('🔍 initializePlacementHubData - Initializing default data...');
    
    const defaultData = await getDefaultPlacementData();
    
    await connectDB();
    
    const updatedData = await PlacementHub.findOneAndUpdate(
      {},
      { 
        ...defaultData,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    console.log('✅ initializePlacementHubData - Default data initialized successfully');
    
    revalidatePath('/admin/placementhub');
    revalidatePath('/students/placementhub');
    
    return { 
      success: true, 
      message: 'Placement hub data initialized successfully' 
    };
  } catch (error) {
    console.error('❌ initializePlacementHubData - Error:', error);
    throw new Error('Failed to initialize placement hub data');
  }
}
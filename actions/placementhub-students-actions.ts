// actions/placementhub-students-actions.ts

'use server';

import { connectDB } from '@/lib/db';
import PlacementHub from '@/models/PlacementHub';
import { Student } from '@/models/Students';
import { revalidatePath } from 'next/cache';
import { PlacementHubData, ResumeTemplate } from '@/types/placementhub';

export async function getPlacementHubData(): Promise<PlacementHubData> {
  try {
    console.log('🔍 getPlacementHubData - Fetching placement hub data...');
    
    await connectDB();
    
    const placementData = await PlacementHub.findOne().sort({ updatedAt: -1 }).lean();
    
    if (!placementData) {
      console.log('❌ getPlacementHubData - No placement hub data found, creating default...');
      
      // Initialize default data if none exists
      try {
        const defaultData = await getDefaultPlacementData();
        
        const newPlacementData = new PlacementHub(defaultData);
        await newPlacementData.save();
        
        console.log('✅ getPlacementHubData - Default data created successfully');
        
        return convertToPlacementHubData(newPlacementData.toObject());
      } catch (initError) {
        console.error('❌ getPlacementHubData - Failed to create default data:', initError);
        // Return default data even if save fails
        return await getDefaultPlacementData();
      }
    }

    console.log('✅ getPlacementHubData - Successfully fetched placement data');
    
    const formattedData = convertToPlacementHubData(placementData);
    return formattedData;
  } catch (error) {
    console.error('❌ getPlacementHubData - Error:', error);
    // Return default data even if there's an error
    return await getDefaultPlacementData();
  }
}

function convertToPlacementHubData(doc: any): PlacementHubData {
  const data = Array.isArray(doc) ? doc[0] : doc;

  if (!data) {
    return getDefaultPlacementDataSync();
  }

  // Use JSON serialization to remove MongoDB-specific properties
  const serializedData = JSON.parse(JSON.stringify(data));

  return {
    _id: serializedData._id?.toString() || 'unknown',
    mustHaveSkills: Array.isArray(serializedData.mustHaveSkills) ? serializedData.mustHaveSkills : [],
    goodToHaveSkills: Array.isArray(serializedData.goodToHaveSkills) ? serializedData.goodToHaveSkills : [],
    toolsAndPractice: {
      mockInterviewPortal: serializedData.toolsAndPractice?.mockInterviewPortal || 'https://pramp.com',
      resumeTemplates: Array.isArray(serializedData.toolsAndPractice?.resumeTemplates) 
        ? serializedData.toolsAndPractice.resumeTemplates.map((template: any) => ({
            title: template.title || '',
            url: template.url || '',
            type: template.type || 'external',
            source: template.source || '',
            description: template.description || ''
          }))
        : getDefaultResumeTemplates(),
      topCodingProblems: Array.isArray(serializedData.toolsAndPractice?.topCodingProblems) 
        ? serializedData.toolsAndPractice.topCodingProblems.map((problem: any) => ({
            title: problem.title || '',
            platform: problem.platform || '',
            url: problem.url || ''
          }))
        : [],
      contestCalendar: Array.isArray(serializedData.toolsAndPractice?.contestCalendar) 
        ? serializedData.toolsAndPractice.contestCalendar.map((contest: any) => ({
            name: contest.name || '',
            date: new Date(contest.date),
            platform: contest.platform || ''
          }))
        : []
    },
    interviewTips: Array.isArray(serializedData.interviewTips) 
      ? serializedData.interviewTips.map((tip: any) => ({
          title: tip.title || '',
          description: tip.description || ''
        }))
      : [],
    updatedAt: new Date(serializedData.updatedAt || new Date())
  };
}

function getDefaultResumeTemplates(): ResumeTemplate[] {
  return [
    {
      title: 'Google Docs Resume Template',
      url: 'https://docs.google.com/document/u/0/?ftv=1&tgif=c',
      type: 'external',
      source: 'Google Docs',
      description: 'Free, editable templates directly in Google Docs - most reliable option'
    },
    {
      title: 'Canva Modern Resume',
      url: 'https://www.canva.com/resumes/templates/',
      type: 'external',
      source: 'Canva',
      description: 'Beautiful, customizable resume templates with drag-and-drop editor'
    },
    {
      title: 'Microsoft Office Templates',
      url: 'https://templates.office.com/en-us/resumes-and-cover-letters',
      type: 'external',
      source: 'Microsoft Office',
      description: 'Professional templates for Word, PowerPoint, and Excel'
    }
  ];
}

// Synchronous version for internal use
function getDefaultPlacementDataSync(): PlacementHubData {
  return {
    _id: 'default',
    mustHaveSkills: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
      'System Design',
      'Problem Solving'
    ],
    goodToHaveSkills: [
      'Web Development (React/Node.js)',
      'Machine Learning',
      'Cloud Computing (AWS/Azure/GCP)',
      'DevOps & CI/CD',
      'Mobile Development',
      'Python Programming',
      'JavaScript/TypeScript'
    ],
    toolsAndPractice: {
      mockInterviewPortal: 'https://pramp.com',
      resumeTemplates: getDefaultResumeTemplates(),
      topCodingProblems: [
        { title: 'Two Sum', platform: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/' },
        { title: 'Reverse Linked List', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/' }
      ],
      contestCalendar: [
        { name: 'Google Code Jam', date: new Date('2024-03-15'), platform: 'Google' },
        { name: 'Facebook Hacker Cup', date: new Date('2024-04-01'), platform: 'Meta' }
      ]
    },
    interviewTips: [
      { 
        title: 'Behavioral Questions', 
        description: 'Prepare STAR method for behavioral questions' 
      },
      { 
        title: 'Technical Interviews', 
        description: 'Practice whiteboarding and explaining your thought process' 
      }
    ],
    updatedAt: new Date()
  };
}

// Async version for export
export async function getDefaultPlacementData(): Promise<PlacementHubData> {
  return getDefaultPlacementDataSync();
}

// ... rest of the functions remain the same ...
export async function downloadTemplate(templateUrl: string, templateTitle: string) {
  try {
    console.log('🔍 downloadTemplate - Downloading template:', { templateUrl, templateTitle });
    
    // Check if it's a local file or external URL
    const isLocalFile = templateUrl.startsWith('/templates/');
    const isExternal = templateUrl.startsWith('http');
    
    // Track download in user's profile if authenticated
    const { getCurrentUser } = await import('@/actions/userActions');
    const user = await getCurrentUser();
    
    if (user) {
      await connectDB();
      try {
        await Student.findByIdAndUpdate(user._id, {
          $push: {
            downloadedResources: {
              type: 'resume_template',
              title: templateTitle,
              url: templateUrl,
              downloadedAt: new Date(),
              isExternal: isExternal
            }
          }
        });
        console.log('✅ downloadTemplate - Download tracked in user profile');
      } catch (trackError) {
        console.warn('⚠️ downloadTemplate - Failed to track download in user profile:', trackError);
        // Continue even if tracking fails
      }
    }
    
    if (isLocalFile) {
      // For local files, we can trigger download directly
      return { 
        success: true, 
        url: templateUrl, 
        external: false,
        local: true,
        message: 'Template download starting...' 
      };
    } else if (isExternal) {
      // For external URLs, open in new tab
      return { 
        success: true, 
        url: templateUrl, 
        external: true,
        local: false,
        message: 'Opening template source...' 
      };
    }
    
    throw new Error('Invalid template URL');
  } catch (error) {
    console.error('❌ downloadTemplate - Error:', error);
    // Still return success to allow the download to proceed
    return { 
      success: true, 
      url: templateUrl, 
      external: true,
      local: false,
      message: 'Opening template...' 
    };
  }
}

export async function saveResourceToProfile(resourceId: string, resourceType: string, title: string) {
  try {
    console.log('🔍 saveResourceToProfile - Saving resource:', { resourceId, resourceType, title });
    
    const { getCurrentUser } = await import('@/actions/userActions');
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    await connectDB();
    
    const result = await Student.findByIdAndUpdate(
      user._id,
      {
        $addToSet: {
          savedResources: {
            resourceId,
            resourceType,
            title,
            savedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!result) {
      throw new Error('User not found');
    }

    console.log('✅ saveResourceToProfile - Resource saved successfully');
    revalidatePath('/students/placementhub');
    
    return { success: true, message: 'Resource saved successfully' };
  } catch (error) {
    console.error('❌ saveResourceToProfile - Error:', error);
    throw new Error('Failed to save resource');
  }
}
'use server';

import { connectDB } from '../lib/db';
import { User } from '../models/User';

// Helper function to update streak
function updateStreak(user: any) {
  const today = new Date();
  const lastActive = new Date(user.learningStats.lastActive);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if last activity was yesterday (maintain streak)
  if (lastActive.toDateString() === yesterday.toDateString()) {
    user.learningStats.currentStreak += 1;
  } 
  // Check if last activity was not today and not yesterday (break streak)
  else if (lastActive.toDateString() !== today.toDateString() && lastActive.toDateString() !== yesterday.toDateString()) {
    user.learningStats.currentStreak = 1;
  }

  // Update longest streak
  if (user.learningStats.currentStreak > user.learningStats.longestStreak) {
    user.learningStats.longestStreak = user.learningStats.currentStreak;
  }

  user.learningStats.lastActive = new Date();
}

// Helper function to log activity
function logActivity(user: any, action: string, stepId?: string, resourceId?: string, metadata?: any) {
  user.activityLog.push({
    action,
    stepId,
    resourceId,
    timestamp: new Date(),
    metadata
  });

  // Update relevant stats based on action
  switch (action) {
    case 'viewed_resource':
      user.learningStats.resourcesViewed += 1;
      break;
    case 'completed_step':
      user.learningStats.stepsCompleted += 1;
      break;
    case 'logged_in':
      user.learningStats.loginCount += 1;
      break;
    case 'code_submission':
      user.learningStats.totalCodeSubmissions += 1;
      break;
    case 'project_submission':
      user.learningStats.totalProjectSubmissions += 1;
      break;
  }

  updateStreak(user);
}

// Helper function to calculate engagement score
function calculateEngagementScore(progress: any): number {
  if (!progress) return 0;

  let score = 0;
  
  // Time spent (max 40 points)
  const timeScore = Math.min(progress.timeSpentOnStep / 60, 40); // 1 hour = 40 points
  score += timeScore;
  
  // Resources viewed (max 30 points)
  const resourceScore = Math.min(progress.resourcesViewed?.length * 10 || 0, 30);
  score += resourceScore;
  
  // Recent activity (max 30 points)
  const daysSinceLastActivity = progress.lastActivity ? 
    (new Date().getTime() - new Date(progress.lastActivity).getTime()) / (1000 * 60 * 60 * 24) : 999;
  
  const activityScore = daysSinceLastActivity < 7 ? 30 : 
                       daysSinceLastActivity < 14 ? 20 : 
                       daysSinceLastActivity < 30 ? 10 : 0;
  score += activityScore;

  return Math.min(Math.round(score), 100);
}

// Helper function to auto-complete step
async function autoCompleteStep(user: any, stepId: string) {
  const progressIndex = user.roadmapProgress.findIndex((p: any) => 
    p.stepId && p.stepId.toString() === stepId
  );
  
  if (progressIndex === -1) return;
  
  const progress = user.roadmapProgress[progressIndex];
  const engagementScore = calculateEngagementScore(progress);
  
  // Auto-complete if engagement score is high enough
  if (engagementScore >= 70 && !progress.completed) {
    progress.completed = true;
    progress.completedAt = new Date();
    progress.autoCompleted = true;
    progress.engagementScore = engagementScore;
    
    user.learningStats.stepsCompleted += 1;
    
    // Log auto-completion
    logActivity(user, 'completed_step', stepId, undefined, { 
      autoCompleted: true, 
      engagementScore: engagementScore 
    });
    
    await user.save();
  }
}

// Track time spent on a step (called automatically)
export async function trackTimeSpentAction(userId: string, stepId: string, duration: number) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Type assertion for user document
    const userDoc = user as any;
    
    let progress = userDoc.roadmapProgress.find((p: any) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (!progress) {
      // Create progress entry if it doesn't exist
      progress = {
        stepId: stepId,
        year: userDoc.year,
        completed: false,
        startedAt: new Date(),
        timeSpent: 0,
        timeSpentOnStep: 0,
        lastActivity: new Date(),
        resourcesViewed: [],
        engagementScore: 0,
        autoCompleted: false
      };
      userDoc.roadmapProgress.push(progress);
    }
    
    progress.timeSpent += duration;
    progress.timeSpentOnStep += duration;
    progress.lastActivity = new Date();
    
    userDoc.learningStats.totalTimeSpent += duration;
    
    // Log time spent
    logActivity(userDoc, 'time_spent', stepId, undefined, { duration });
    
    // Check if step should be auto-completed
    await autoCompleteStep(userDoc, stepId);
    
    await userDoc.save();
    return { success: true };
  } catch (error) {
    console.error('Error tracking time spent:', error);
    return { success: false, error: 'Failed to track time' };
  }
}

// Track resource viewing with auto-progress
export async function trackResourceViewAction(userId: string, stepId: string, resourceUrl: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Type assertion for user document
    const userDoc = user as any;
    
    let progress = userDoc.roadmapProgress.find((p: any) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (!progress) {
      // Create progress entry
      progress = {
        stepId: stepId,
        year: userDoc.year,
        completed: false,
        startedAt: new Date(),
        timeSpent: 0,
        timeSpentOnStep: 0,
        lastActivity: new Date(),
        resourcesViewed: [],
        engagementScore: 0,
        autoCompleted: false
      };
      userDoc.roadmapProgress.push(progress);
    }

    // Add resource to viewed list if not already there
    if (!progress.resourcesViewed.includes(resourceUrl)) {
      progress.resourcesViewed.push(resourceUrl);
    }

    progress.lastActivity = new Date();
    
    logActivity(userDoc, 'viewed_resource', stepId, undefined, { resourceUrl });
    userDoc.learningStats.resourcesViewed += 1;

    // Check for auto-completion
    await autoCompleteStep(userDoc, stepId);
    
    await userDoc.save();
    return { success: true };
  } catch (error) {
    console.error('Error tracking resource view:', error);
    return { success: false, error: 'Failed to track resource view' };
  }
}

// Track code/project submissions
export async function trackSubmissionAction(userId: string, stepId: string, type: 'code' | 'project', metadata?: any) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Type assertion for user document
    const userDoc = user as any;
    const action = type === 'code' ? 'code_submission' : 'project_submission';
    
    logActivity(userDoc, action, stepId, undefined, metadata);
    
    if (type === 'code') {
      userDoc.learningStats.totalCodeSubmissions += 1;
    } else {
      userDoc.learningStats.totalProjectSubmissions += 1;
    }

    // High weight for submissions - auto-complete if they submit work
    await autoCompleteStep(userDoc, stepId);
    
    await userDoc.save();
    return { success: true };
  } catch (error) {
    console.error('Error tracking submission:', error);
    return { success: false, error: 'Failed to track submission' };
  }
}

// Get engagement analytics for a step
export async function getStepEngagementAction(userId: string, stepId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('roadmapProgress learningStats')
      .lean();

    if (!user) {
      return { success: false, error: 'User not found', data: null };
    }

    // Type assertion for user data
    const userData = user as any;
    const progress = userData.roadmapProgress?.find((p: any) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (!progress) {
      return { 
        success: true, 
        data: {
          engagementScore: 0,
          timeSpent: 0,
          resourcesViewed: 0,
          completed: false,
          autoCompleted: false
        }
      };
    }

    const engagementScore = calculateEngagementScore(progress);

    return { 
      success: true, 
      data: {
        engagementScore: engagementScore,
        timeSpent: progress.timeSpentOnStep || 0,
        resourcesViewed: progress.resourcesViewed?.length || 0,
        completed: progress.completed || false,
        autoCompleted: progress.autoCompleted || false
      }
    };
  } catch (error) {
    console.error('Error getting step engagement:', error);
    return { 
      success: false, 
      error: 'Failed to get engagement data',
      data: null
    };
  }
}
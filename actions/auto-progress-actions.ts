'use server';

import { connectDB } from '../lib/db';
import { User } from '../models/User';
import { Types } from 'mongoose';

interface TrackResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface EngagementData {
  engagementScore: number;
  timeSpent: number;
  resourcesViewed: number;
  completed: boolean;
  autoCompleted: boolean;
  progressPercentage: number;
}

interface EngagementResult {
  success: boolean;
  error?: string;
  data?: EngagementData | null;
}

interface ProgressItem {
  stepId: Types.ObjectId;
  year: number;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number;
  lastActivity: Date;
  resourcesViewed: string[];
  timeSpentOnStep: number;
  engagementScore: number;
  autoCompleted: boolean;
}

interface LearningStats {
  totalTimeSpent: number;
  stepsCompleted: number;
  resourcesViewed: number;
  lastActive: Date;
  currentStreak: number;
  longestStreak: number;
  loginCount: number;
  averageEngagement: number;
  totalCodeSubmissions: number;
  totalProjectSubmissions: number;
}

interface ActivityLogItem {
  action: string;
  stepId?: Types.ObjectId;
  resourceId?: Types.ObjectId;
  timestamp: Date;
  metadata?: any;
  duration?: number;
}

interface UserDocument {
  _id: Types.ObjectId;
  year: number;
  roadmapProgress: ProgressItem[];
  learningStats: LearningStats;
  activityLog: ActivityLogItem[];
  save(): Promise<any>;
}

// Enhanced initialization with roadmap integration
async function initializeUserProgress(user: UserDocument): Promise<void> {
  if (!user.roadmapProgress) {
    user.roadmapProgress = [];
  }
  
  if (!user.learningStats) {
    user.learningStats = {
      totalTimeSpent: 0,
      stepsCompleted: 0,
      resourcesViewed: 0,
      lastActive: new Date(),
      currentStreak: 0,
      longestStreak: 0,
      loginCount: 0,
      averageEngagement: 0,
      totalCodeSubmissions: 0,
      totalProjectSubmissions: 0
    };
  } else {
    // Ensure all learningStats fields are valid numbers
    user.learningStats.totalTimeSpent = user.learningStats.totalTimeSpent || 0;
    user.learningStats.stepsCompleted = user.learningStats.stepsCompleted || 0;
    user.learningStats.resourcesViewed = user.learningStats.resourcesViewed || 0;
    user.learningStats.currentStreak = user.learningStats.currentStreak || 0;
    user.learningStats.longestStreak = user.learningStats.longestStreak || 0;
    user.learningStats.loginCount = user.learningStats.loginCount || 0;
    user.learningStats.averageEngagement = user.learningStats.averageEngagement || 0;
    user.learningStats.totalCodeSubmissions = user.learningStats.totalCodeSubmissions || 0;
    user.learningStats.totalProjectSubmissions = user.learningStats.totalProjectSubmissions || 0;
    
    if (!user.learningStats.lastActive || isNaN(new Date(user.learningStats.lastActive).getTime())) {
      user.learningStats.lastActive = new Date();
    }
  }
  
  if (!user.activityLog) {
    user.activityLog = [];
  }
}

// Enhanced streak tracking
function updateStreak(user: UserDocument): void {
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

// Enhanced activity logging
function logActivity(
  user: UserDocument, 
  action: string, 
  stepId?: string, 
  resourceId?: string, 
  metadata?: any,
  duration?: number
): void {
  
  const activityItem: ActivityLogItem = {
    action,
    timestamp: new Date(),
    metadata
  };

  if (stepId) {
    activityItem.stepId = new Types.ObjectId(stepId);
  }

  if (resourceId) {
    activityItem.resourceId = new Types.ObjectId(resourceId);
  }

  if (duration) {
    activityItem.duration = duration;
  }

  user.activityLog.push(activityItem);

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

// Enhanced engagement score calculation
function calculateEngagementScore(progress: ProgressItem | null): number {
  if (!progress) return 0;

  let score = 0;
  
  // Time spent (max 40 points) - more weight for actual learning time
  const timeScore = Math.min((progress.timeSpentOnStep / 3600) * 20, 40); // 1 hour = 20 points
  score += timeScore;
  
  // Resources viewed (max 30 points) - bonus for exploring multiple resources
  const resourceScore = Math.min(progress.resourcesViewed?.length * 15 || 0, 30);
  score += resourceScore;
  
  // Recent activity (max 30 points) - encourages consistent engagement
  const daysSinceLastActivity = progress.lastActivity ? 
    (new Date().getTime() - new Date(progress.lastActivity).getTime()) / (1000 * 60 * 60 * 24) : 999;
  
  const activityScore = daysSinceLastActivity < 1 ? 30 : 
                       daysSinceLastActivity < 3 ? 25 : 
                       daysSinceLastActivity < 7 ? 20 : 
                       daysSinceLastActivity < 14 ? 15 : 
                       daysSinceLastActivity < 30 ? 10 : 0;
  score += activityScore;

  return Math.min(Math.round(score), 100);
}

// Enhanced auto-completion with roadmap awareness
async function autoCompleteStep(user: UserDocument, stepId: string, roadmapData?: any): Promise<boolean> {
  const roadmapProgress = user.roadmapProgress || [];
  
  const progressIndex = roadmapProgress.findIndex((p: ProgressItem) => 
    p.stepId && p.stepId.toString() === stepId
  );
  
  if (progressIndex === -1) return false;
  
  const progress = roadmapProgress[progressIndex];
  const engagementScore = calculateEngagementScore(progress);
  
  // Enhanced auto-completion logic
  const shouldAutoComplete = 
    // High engagement score
    (engagementScore >= 70) ||
    // Viewed all resources for this step
    (roadmapData && progress.resourcesViewed?.length >= roadmapData.resources?.length) ||
    // Significant time investment (2+ hours)
    (progress.timeSpentOnStep >= 120);
  
  if (shouldAutoComplete && !progress.completed) {
    progress.completed = true;
    progress.completedAt = new Date();
    progress.autoCompleted = true;
    progress.engagementScore = engagementScore;
    
    user.learningStats.stepsCompleted += 1;
    
    // Log auto-completion
    logActivity(user, 'completed_step', stepId, undefined, { 
      autoCompleted: true, 
      engagementScore: engagementScore,
      trigger: shouldAutoComplete ? 'engagement' : 'resources_completed'
    });
    
    await user.save();
    return true;
  }
  
  return false;
}

// Enhanced time tracking with roadmap context
export async function trackTimeSpentAction(
  userId: string, 
  stepId: string, 
  duration: number, 
  roadmapData?: any
): Promise<TrackResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('+roadmapProgress +learningStats +activityLog year') as UserDocument | null;
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await initializeUserProgress(user);
    
    const roadmapProgress = user.roadmapProgress || [];
    
    let progress = roadmapProgress.find((p: ProgressItem) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (!progress) {
      progress = {
        stepId: new Types.ObjectId(stepId),
        year: user.year,
        completed: false,
        startedAt: new Date(),
        timeSpent: 0,
        timeSpentOnStep: 0,
        lastActivity: new Date(),
        resourcesViewed: [],
        engagementScore: 0,
        autoCompleted: false
      };
      roadmapProgress.push(progress);
    }
    
    const safeDuration = isNaN(duration) || duration < 0 ? 0 : duration;
    
    progress.timeSpent += safeDuration;
    progress.timeSpentOnStep += safeDuration;
    progress.lastActivity = new Date();
    progress.engagementScore = calculateEngagementScore(progress);
    
    const currentTotalTime = user.learningStats.totalTimeSpent || 0;
    user.learningStats.totalTimeSpent = (isNaN(currentTotalTime) ? 0 : currentTotalTime) + safeDuration;
    
    logActivity(user, 'time_spent', stepId, undefined, { duration: safeDuration }, safeDuration);
    
    // Check auto-completion with roadmap context
    const wasAutoCompleted = await autoCompleteStep(user, stepId, roadmapData);
    
    await user.save();
    
    return { 
      success: true, 
      data: { 
        wasAutoCompleted,
        engagementScore: progress.engagementScore,
        totalTimeSpent: progress.timeSpentOnStep
      }
    };
  } catch (error) {
    console.error('Error tracking time spent:', error);
    return { success: false, error: 'Failed to track time' };
  }
}

// Enhanced resource tracking
export async function trackResourceViewAction(
  userId: string, 
  stepId: string, 
  resourceUrl: string,
  resourceType?: string,
  roadmapData?: any
): Promise<TrackResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('+roadmapProgress +learningStats +activityLog year') as UserDocument | null;
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await initializeUserProgress(user);
    
    const roadmapProgress = user.roadmapProgress || [];
    
    let progress = roadmapProgress.find((p: ProgressItem) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (!progress) {
      progress = {
        stepId: new Types.ObjectId(stepId),
        year: user.year,
        completed: false,
        startedAt: new Date(),
        timeSpent: 0,
        timeSpentOnStep: 0,
        lastActivity: new Date(),
        resourcesViewed: [],
        engagementScore: 0,
        autoCompleted: false
      };
      roadmapProgress.push(progress);
    }

    if (!progress.resourcesViewed.includes(resourceUrl)) {
      progress.resourcesViewed.push(resourceUrl);
    }

    progress.lastActivity = new Date();
    progress.engagementScore = calculateEngagementScore(progress);
    
    logActivity(user, 'viewed_resource', stepId, undefined, { 
      resourceUrl, 
      resourceType,
      totalResourcesViewed: progress.resourcesViewed.length 
    });
    
    user.learningStats.resourcesViewed += 1;

    const wasAutoCompleted = await autoCompleteStep(user, stepId, roadmapData);
    
    await user.save();
    
    return { 
      success: true, 
      data: { 
        wasAutoCompleted,
        engagementScore: progress.engagementScore,
        resourcesViewed: progress.resourcesViewed.length
      }
    };
  } catch (error) {
    console.error('Error tracking resource view:', error);
    return { success: false, error: 'Failed to track resource view' };
  }
}

// Enhanced submission tracking
export async function trackSubmissionAction(
  userId: string, 
  stepId: string, 
  type: 'code' | 'project', 
  metadata?: any,
  roadmapData?: any
): Promise<TrackResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('+roadmapProgress +learningStats +activityLog') as UserDocument | null;
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await initializeUserProgress(user);
    
    const action = type === 'code' ? 'code_submission' : 'project_submission';
    
    logActivity(user, action, stepId, undefined, metadata);
    
    if (type === 'code') {
      user.learningStats.totalCodeSubmissions += 1;
    } else {
      user.learningStats.totalProjectSubmissions += 1;
    }

    // High weight for submissions - auto-complete immediately
    const wasAutoCompleted = await autoCompleteStep(user, stepId, roadmapData);
    
    await user.save();
    
    return { 
      success: true, 
      data: { 
        wasAutoCompleted,
        submissionType: type
      }
    };
  } catch (error) {
    console.error('Error tracking submission:', error);
    return { success: false, error: 'Failed to track submission' };
  }
}

// Enhanced engagement analytics
export async function getStepEngagementAction(userId: string, stepId: string): Promise<EngagementResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('roadmapProgress learningStats')
      .lean();

    if (!user) {
      return { success: false, error: 'User not found', data: null };
    }

    const userData = user as any;
    const roadmapProgress = userData.roadmapProgress || [];
    
    const progress = roadmapProgress.find((p: any) => 
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
          autoCompleted: false,
          progressPercentage: 0
        }
      };
    }

    const engagementScore = calculateEngagementScore(progress);
    
    // Calculate progress percentage based on multiple factors
    const timeFactor = Math.min(progress.timeSpentOnStep / 180, 1); // 3 hours max
    const resourceFactor = progress.resourcesViewed?.length > 0 ? 0.3 : 0;
    const engagementFactor = engagementScore / 100;
    
    const progressPercentage = Math.min(
      (timeFactor * 0.4 + resourceFactor * 0.3 + engagementFactor * 0.3) * 100,
      100
    );

    return { 
      success: true, 
      data: {
        engagementScore: engagementScore,
        timeSpent: progress.timeSpentOnStep || 0,
        resourcesViewed: progress.resourcesViewed?.length || 0,
        completed: progress.completed || false,
        autoCompleted: progress.autoCompleted || false,
        progressPercentage: Math.round(progressPercentage)
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

// Enhanced manual completion
export async function markStepCompletedAction(userId: string, stepId: string): Promise<TrackResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('+roadmapProgress +learningStats +activityLog year') as UserDocument | null;
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await initializeUserProgress(user);
    
    const roadmapProgress = user.roadmapProgress || [];
    
    let progress = roadmapProgress.find((p: ProgressItem) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (!progress) {
      progress = {
        stepId: new Types.ObjectId(stepId),
        year: user.year,
        completed: true,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 0,
        timeSpentOnStep: 0,
        lastActivity: new Date(),
        resourcesViewed: [],
        engagementScore: 100,
        autoCompleted: false
      };
      roadmapProgress.push(progress);
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
      progress.autoCompleted = false;
      progress.engagementScore = 100;
    }
    
    user.learningStats.stepsCompleted += 1;
    
    logActivity(user, 'completed_step', stepId, undefined, { 
      autoCompleted: false, 
      manuallyCompleted: true 
    });
    
    await user.save();
    
    return { 
      success: true, 
      data: {
        stepId,
        completed: true,
        manuallyCompleted: true
      }
    };
  } catch (error) {
    console.error('Error marking step as completed:', error);
    return { success: false, error: 'Failed to mark step as completed' };
  }
}

// Enhanced progress reset
export async function resetStepProgressAction(userId: string, stepId: string): Promise<TrackResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('+roadmapProgress +learningStats') as UserDocument | null;
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await initializeUserProgress(user);
    
    const roadmapProgress = user.roadmapProgress || [];
    
    const progressIndex = roadmapProgress.findIndex((p: ProgressItem) => 
      p.stepId && p.stepId.toString() === stepId
    );
    
    if (progressIndex !== -1) {
      roadmapProgress.splice(progressIndex, 1);
      await user.save();
    }
    
    return { 
      success: true, 
      data: {
        stepId,
        reset: true
      }
    };
  } catch (error) {
    console.error('Error resetting step progress:', error);
    return { success: false, error: 'Failed to reset step progress' };
  }
}

// Enhanced progress statistics
export async function getUserProgressStatsAction(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('learningStats roadmapProgress')
      .lean();

    if (!user) {
      return { success: false, error: 'User not found', data: null };
    }

    const userData = user as any;
    const learningStats = userData.learningStats || {};
    const roadmapProgress = userData.roadmapProgress || [];

    const completedSteps = roadmapProgress.filter((p: any) => p.completed).length;
    const totalSteps = roadmapProgress.length;
    const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Calculate average engagement across all steps
    const totalEngagement = roadmapProgress.reduce((sum: number, p: any) => sum + (p.engagementScore || 0), 0);
    const averageEngagement = totalSteps > 0 ? Math.round(totalEngagement / totalSteps) : 0;

    return {
      success: true,
      data: {
        completedSteps,
        totalSteps,
        completionRate,
        totalTimeSpent: learningStats.totalTimeSpent || 0,
        resourcesViewed: learningStats.resourcesViewed || 0,
        currentStreak: learningStats.currentStreak || 0,
        longestStreak: learningStats.longestStreak || 0,
        averageEngagement,
        totalCodeSubmissions: learningStats.totalCodeSubmissions || 0,
        totalProjectSubmissions: learningStats.totalProjectSubmissions || 0,
        autoCompletedSteps: roadmapProgress.filter((p: any) => p.autoCompleted).length
      }
    };
  } catch (error) {
    console.error('Error getting user progress stats:', error);
    return { success: false, error: 'Failed to get progress stats', data: null };
  }
}

// New: Get detailed progress for roadmap
export async function getRoadmapProgressAction(userId: string, roadmapId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('roadmapProgress learningStats')
      .lean();

    if (!user) {
      return { success: false, error: 'User not found', data: null };
    }

    const userData = user as any;
    const roadmapProgress = userData.roadmapProgress || [];
    
    // Filter progress for this specific roadmap
    const roadmapProgressData = roadmapProgress.filter((p: any) => 
      p.stepId && p.stepId.toString() === roadmapId
    );

    const completedSteps = roadmapProgressData.filter((p: any) => p.completed).length;
    const totalSteps = roadmapProgressData.length;
    const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      success: true,
      data: {
        roadmapId,
        completedSteps,
        totalSteps,
        completionRate,
        steps: roadmapProgressData.map((p: any) => ({
          stepId: p.stepId,
          completed: p.completed,
          autoCompleted: p.autoCompleted,
          engagementScore: p.engagementScore,
          timeSpent: p.timeSpentOnStep,
          resourcesViewed: p.resourcesViewed?.length || 0,
          lastActivity: p.lastActivity
        }))
      }
    };
  } catch (error) {
    console.error('Error getting roadmap progress:', error);
    return { success: false, error: 'Failed to get roadmap progress', data: null };
  }
}
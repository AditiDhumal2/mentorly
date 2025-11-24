// actions/professionalbranding-students-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { BrandingChecklist, Student } from '@/models/BrandingChecklist';
import { getCurrentUser } from '@/actions/userActions';
import { revalidatePath } from 'next/cache';
import { BrandingProgressStats, BrandingChecklistResponse } from '@/types/professionalBranding';
import { Types } from 'mongoose';

export async function getBrandingChecklist(): Promise<BrandingChecklistResponse> {
  try {
    console.log('🔍 getBrandingChecklist - Starting...');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ getBrandingChecklist - No user found');
      return { success: false, error: 'User not authenticated' };
    }

    if (user.role !== 'student') {
      console.log('❌ getBrandingChecklist - User is not a student');
      return { success: false, error: 'Access denied' };
    }

    // Use type assertion for student-specific properties
    const studentUser = user as any;
    console.log('🔍 getBrandingChecklist - User year:', studentUser.year);
    
    await connectDB();

    // Get checklist for user's year
    const checklist = await BrandingChecklist.findOne({ year: studentUser.year }).lean();
    
    if (!checklist) {
      console.log('❌ getBrandingChecklist - No checklist found for year:', studentUser.year);
      return { success: false, error: 'No checklist found for your year' };
    }

    // Get user's progress
    const student = await Student.findById(user._id).select('brandingProgress').lean();
    const userProgress = student?.brandingProgress || [];

    // Convert user progress to plain objects for easier comparison
    const userProgressPlain = userProgress.map((progress: any) => ({
      taskId: progress.taskId.toString(),
      completed: progress.completed,
      completedAt: progress.completedAt
    }));

    // Calculate progress stats
    const completedTasks = userProgress.filter((p: any) => p.completed).length;
    const totalTasks = checklist.tasks.length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const progressStats: BrandingProgressStats = {
      completed: completedTasks,
      total: totalTasks,
      percentage
    };

    console.log('✅ getBrandingChecklist - Success:', {
      tasks: checklist.tasks.length,
      completed: completedTasks,
      percentage
    });

    return {
      success: true,
      checklist: {
        _id: checklist._id.toString(),
        year: checklist.year,
        tasks: checklist.tasks.map((task: any) => ({
          _id: task._id.toString(),
          title: task.title,
          description: task.description,
          category: task.category,
          doneBy: task.doneBy,
          optional: task.optional || false,
          tutorial: task.tutorial,
          order: task.order
        })),
        createdAt: checklist.createdAt,
        updatedAt: checklist.updatedAt
      },
      progress: progressStats,
      userProgress: userProgressPlain
    };
  } catch (error) {
    console.error('❌ getBrandingChecklist - Error:', error);
    return { success: false, error: 'Failed to fetch branding checklist' };
  }
}

export async function updateBrandingProgress(
  taskId: string, 
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 updateBrandingProgress - Starting...', { taskId, completed });
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    // Use type assertion for student-specific properties
    const studentUser = user as any;

    await connectDB();

    const student = await Student.findById(user._id);
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Validate taskId is a valid ObjectId
    if (!Types.ObjectId.isValid(taskId)) {
      return { success: false, error: 'Invalid task ID' };
    }

    // Convert string taskId to ObjectId
    const taskObjectId = new Types.ObjectId(taskId);

    // Verify the task exists in the checklist
    const checklist = await BrandingChecklist.findOne({ 
      year: studentUser.year,
      'tasks._id': taskObjectId 
    });

    if (!checklist) {
      return { success: false, error: 'Task not found in checklist' };
    }

    // Find existing progress for this task
    const existingProgressIndex = student.brandingProgress.findIndex(
      (p: any) => p.taskId.toString() === taskId
    );

    if (existingProgressIndex > -1) {
      // Update existing progress
      student.brandingProgress[existingProgressIndex].completed = completed;
      student.brandingProgress[existingProgressIndex].completedAt = completed ? new Date() : undefined;
    } else {
      // Add new progress with ObjectId
      student.brandingProgress.push({
        taskId: taskObjectId,
        completed: completed,
        completedAt: completed ? new Date() : undefined
      });
    }

    await student.save();

    console.log('✅ updateBrandingProgress - Success:', {
      taskId,
      completed,
      totalProgress: student.brandingProgress.length
    });

    revalidatePath('/students/professionalbranding');
    
    return { success: true };
  } catch (error) {
    console.error('❌ updateBrandingProgress - Error:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

export async function resetBrandingChecklist(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 resetBrandingChecklist - Starting...');
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    await connectDB();

    const student = await Student.findById(user._id);
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Clear all branding progress
    student.brandingProgress = [];
    await student.save();

    console.log('✅ resetBrandingChecklist - Success: All progress cleared');

    revalidatePath('/students/professionalbranding');
    
    return { success: true };
  } catch (error) {
    console.error('❌ resetBrandingChecklist - Error:', error);
    return { success: false, error: 'Failed to reset checklist' };
  }
}

export async function getBrandingProgressStats(): Promise<{
  success: boolean;
  progress?: BrandingProgressStats;
  error?: string;
}> {
  try {
    console.log('🔍 getBrandingProgressStats - Starting...');
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    // Use type assertion for student-specific properties
    const studentUser = user as any;

    await connectDB();

    // Get checklist for user's year
    const checklist = await BrandingChecklist.findOne({ year: studentUser.year }).lean();
    
    if (!checklist) {
      return { success: false, error: 'No checklist found for your year' };
    }

    // Get user's progress
    const student = await Student.findById(user._id).select('brandingProgress').lean();
    const userProgress = student?.brandingProgress || [];

    // Calculate progress stats
    const completedTasks = userProgress.filter((p: any) => p.completed).length;
    const totalTasks = checklist.tasks.length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const progressStats: BrandingProgressStats = {
      completed: completedTasks,
      total: totalTasks,
      percentage
    };

    console.log('✅ getBrandingProgressStats - Success:', progressStats);

    return {
      success: true,
      progress: progressStats
    };
  } catch (error) {
    console.error('❌ getBrandingProgressStats - Error:', error);
    return { success: false, error: 'Failed to fetch progress stats' };
  }
}

export async function markMultipleTasksAsCompleted(
  taskIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 markMultipleTasksAsCompleted - Starting...', { taskIds });
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    // Use type assertion for student-specific properties
    const studentUser = user as any;

    await connectDB();

    const student = await Student.findById(user._id);
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    const currentTime = new Date();

    for (const taskId of taskIds) {
      // Validate taskId is a valid ObjectId
      if (!Types.ObjectId.isValid(taskId)) {
        console.warn(`⚠️ Invalid task ID: ${taskId}`);
        continue;
      }

      // Verify the task exists in the checklist
      const checklist = await BrandingChecklist.findOne({ 
        year: studentUser.year,
        'tasks._id': new Types.ObjectId(taskId) 
      });

      if (!checklist) {
        console.warn(`⚠️ Task not found in checklist: ${taskId}`);
        continue;
      }

      // Find existing progress for this task
      const existingProgressIndex = student.brandingProgress.findIndex(
        (p: any) => p.taskId.toString() === taskId
      );

      if (existingProgressIndex > -1) {
        // Update existing progress
        student.brandingProgress[existingProgressIndex].completed = true;
        student.brandingProgress[existingProgressIndex].completedAt = currentTime;
      } else {
        // Add new progress with ObjectId
        student.brandingProgress.push({
          taskId: new Types.ObjectId(taskId),
          completed: true,
          completedAt: currentTime
        });
      }
    }

    await student.save();

    console.log('✅ markMultipleTasksAsCompleted - Success:', {
      completedTasks: taskIds.length,
      totalProgress: student.brandingProgress.length
    });

    revalidatePath('/students/professionalbranding');
    
    return { success: true };
  } catch (error) {
    console.error('❌ markMultipleTasksAsCompleted - Error:', error);
    return { success: false, error: 'Failed to update multiple tasks' };
  }
}

export async function getCompletedTasks(): Promise<{
  success: boolean;
  completedTasks?: string[];
  error?: string;
}> {
  try {
    console.log('🔍 getCompletedTasks - Starting...');
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    await connectDB();

    const student = await Student.findById(user._id).select('brandingProgress').lean();
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    const completedTasks = student.brandingProgress
      .filter((p: any) => p.completed)
      .map((p: any) => p.taskId.toString());

    console.log('✅ getCompletedTasks - Success:', {
      completedCount: completedTasks.length
    });

    return {
      success: true,
      completedTasks
    };
  } catch (error) {
    console.error('❌ getCompletedTasks - Error:', error);
    return { success: false, error: 'Failed to fetch completed tasks' };
  }
}

export async function toggleTaskCompletion(
  taskId: string
): Promise<{ success: boolean; completed?: boolean; error?: string }> {
  try {
    console.log('🔍 toggleTaskCompletion - Starting...', { taskId });
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    // Use type assertion for student-specific properties
    const studentUser = user as any;

    await connectDB();

    const student = await Student.findById(user._id);
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Validate taskId is a valid ObjectId
    if (!Types.ObjectId.isValid(taskId)) {
      return { success: false, error: 'Invalid task ID' };
    }

    // Verify the task exists in the checklist
    const checklist = await BrandingChecklist.findOne({ 
      year: studentUser.year,
      'tasks._id': new Types.ObjectId(taskId) 
    });

    if (!checklist) {
      return { success: false, error: 'Task not found in checklist' };
    }

    // Find existing progress for this task
    const existingProgressIndex = student.brandingProgress.findIndex(
      (p: any) => p.taskId.toString() === taskId
    );

    let newCompletedStatus: boolean;

    if (existingProgressIndex > -1) {
      // Toggle existing progress
      newCompletedStatus = !student.brandingProgress[existingProgressIndex].completed;
      student.brandingProgress[existingProgressIndex].completed = newCompletedStatus;
      student.brandingProgress[existingProgressIndex].completedAt = newCompletedStatus ? new Date() : undefined;
    } else {
      // Add new progress as completed
      newCompletedStatus = true;
      student.brandingProgress.push({
        taskId: new Types.ObjectId(taskId),
        completed: newCompletedStatus,
        completedAt: new Date()
      });
    }

    await student.save();

    console.log('✅ toggleTaskCompletion - Success:', {
      taskId,
      completed: newCompletedStatus,
      totalProgress: student.brandingProgress.length
    });

    revalidatePath('/students/professionalbranding');
    
    return { 
      success: true, 
      completed: newCompletedStatus 
    };
  } catch (error) {
    console.error('❌ toggleTaskCompletion - Error:', error);
    return { success: false, error: 'Failed to toggle task completion' };
  }
}

export async function getTaskCompletionStatus(
  taskId: string
): Promise<{ success: boolean; completed?: boolean; error?: string }> {
  try {
    console.log('🔍 getTaskCompletionStatus - Starting...', { taskId });
    
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'student') {
      return { success: false, error: 'User not authenticated' };
    }

    await connectDB();

    const student = await Student.findById(user._id).select('brandingProgress').lean();
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    const taskProgress = student.brandingProgress.find(
      (p: any) => p.taskId.toString() === taskId
    );

    const completed = taskProgress ? taskProgress.completed : false;

    console.log('✅ getTaskCompletionStatus - Success:', {
      taskId,
      completed
    });

    return {
      success: true,
      completed
    };
  } catch (error) {
    console.error('❌ getTaskCompletionStatus - Error:', error);
    return { success: false, error: 'Failed to fetch task completion status' };
  }
}
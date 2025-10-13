'use server';

import { connectDB } from '../lib/db';
import { User } from '../models/User';

interface LanguageActionResult {
  success: boolean;
  error?: string;
}

export async function updatePreferredLanguageAction(userId: string, languageId: string): Promise<LanguageActionResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const userDoc = user as any;
    
    // SAFE ACCESS: Ensure languages array exists
    if (!userDoc.languages) {
      userDoc.languages = [];
    }
    
    userDoc.preferredLanguage = languageId;

    // Add to languages array if not already present
    const languageExists = userDoc.languages.some((lang: any) => lang.languageId === languageId);
    if (!languageExists) {
      userDoc.languages.push({
        languageId,
        proficiency: 'beginner',
        startedAt: new Date()
      });
    }

    await userDoc.save();
    return { success: true };
  } catch (error) {
    console.error('Error updating preferred language:', error);
    return { success: false, error: 'Failed to update language preference' };
  }
}

export async function getUserLanguagesAction(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('preferredLanguage languages')
      .lean();

    if (!user) {
      return { 
        success: false, 
        error: 'User not found', 
        data: {
          preferredLanguage: 'python',
          languages: []
        }
      };
    }

    const userData = user as any;
    
    // SAFE ACCESS: Ensure consistent data structure
    return {
      success: true,
      data: {
        preferredLanguage: userData.preferredLanguage || 'python',
        languages: userData.languages || []
      }
    };
  } catch (error) {
    console.error('Error getting user languages:', error);
    return { 
      success: false, 
      error: 'Failed to get user languages', 
      data: {
        preferredLanguage: 'python',
        languages: []
      }
    };
  }
}
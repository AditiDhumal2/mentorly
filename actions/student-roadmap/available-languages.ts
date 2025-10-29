// actions/student-roadmap/available-languages.ts
'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import type { AvailableLanguagesActionResponse } from '@/types/student-roadmap';

export async function getAvailableLanguagesAction(year?: number): Promise<AvailableLanguagesActionResponse> {
  try {
    await connectDB();
    
    const query = year ? { year } : {};
    const languages = await Roadmap.find(query).distinct('language');
    
    // Filter and format languages with proper typing
    const formattedLanguages = languages
      .filter((lang): lang is string => lang && typeof lang === 'string')
      .map(lang => lang.toLowerCase());
    
    return { 
      success: true, 
      data: formattedLanguages 
    };
  } catch (error) {
    console.error('❌ Error getting available languages:', error);
    return { 
      success: false, 
      error: 'Failed to load available languages' 
    };
  }
}
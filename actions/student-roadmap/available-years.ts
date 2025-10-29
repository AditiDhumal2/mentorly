// actions/student-roadmap/available-years.ts
'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import type { AvailableYearsActionResponse, AvailableYear } from '@/types/student-roadmap';

function getYearLabel(year: number): string {
  const labels: Record<number, string> = {
    1: '1st Year - Foundation',
    2: '2nd Year - Skill Development', 
    3: '3rd Year - Specialization',
    4: '4th Year - Placement Preparation'
  };
  return labels[year] || `Year ${year}`;
}

export async function getAvailableYearsAction(languageId?: string): Promise<AvailableYearsActionResponse> {
  try {
    await connectDB();
    
    const query = languageId ? { language: languageId.toLowerCase() } : {};
    const years = await Roadmap.find(query).distinct('year');
    
    // Convert to numbers and filter valid years
    const availableYearNumbers = years
      .map(year => typeof year === 'number' ? year : Number(year))
      .filter(year => !isNaN(year) && year >= 1 && year <= 4);
    
    // Always return years 1-4, even if some don't exist yet
    const allYears = [1, 2, 3, 4];
    const availableYears: AvailableYear[] = allYears.map(year => ({
      year,
      available: availableYearNumbers.includes(year),
      label: getYearLabel(year)
    }));
    
    return { 
      success: true, 
      data: availableYears 
    };
  } catch (error) {
    console.error('❌ Error getting available years:', error);
    return { 
      success: false, 
      error: 'Failed to load available years' 
    };
  }
}
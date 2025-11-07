// actions/highereducation-admin-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { HigherEducation } from '@/models/HigherEducation';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { 
  Country, 
  ExamPreparation, 
  ApplicationDocument, 
  StudentProgress 
} from '@/types/higher-education';

interface HigherEducationData {
  countries: Country[];
  examPreparations: ExamPreparation[];
  applicationDocuments: ApplicationDocument[];
  studentProgress: StudentProgress[];
}

function serializeDocument(doc: any): any {
  if (!doc) return doc;
  
  if (Array.isArray(doc)) {
    return doc.map(item => serializeDocument(item));
  }
  
  if (doc instanceof mongoose.Document) {
    doc = doc.toObject();
  }
  
  if (doc && typeof doc === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(doc)) {
      if (value instanceof mongoose.Types.ObjectId) {
        result[key] = value.toString();
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => serializeDocument(item));
      } else if (value && typeof value === 'object') {
        result[key] = serializeDocument(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  
  return doc;
}

export async function getHigherEducationData(): Promise<HigherEducationData> {
  try {
    await connectDB();
    
    const data = await HigherEducation.findOne()
      .populate('studentProgress.userId')
      .lean();

    if (!data) {
      return {
        countries: [],
        examPreparations: [],
        applicationDocuments: [],
        studentProgress: []
      };
    }

    // Use type assertion to bypass TypeScript strict checking
    const dataAsAny = data as any;

    return serializeDocument({
      countries: dataAsAny.countries || [],
      examPreparations: dataAsAny.examPreparations || [],
      applicationDocuments: dataAsAny.applicationDocuments || [],
      studentProgress: dataAsAny.studentProgress || []
    }) as HigherEducationData;
  } catch (error) {
    console.error('Error fetching higher education data:', error);
    throw new Error('Failed to fetch higher education data');
  }
}

export async function updateCountriesData(countriesData: Country[]): Promise<{ success: boolean }> {
  try {
    await connectDB();

    await HigherEducation.findOneAndUpdate(
      {},
      { $set: { countries: countriesData } },
      { upsert: true, new: true }
    );

    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error) {
    console.error('Error updating countries data:', error);
    throw new Error('Failed to update countries data');
  }
}

export async function updateExamPreparations(examData: ExamPreparation[]): Promise<{ success: boolean }> {
  try {
    await connectDB();

    await HigherEducation.findOneAndUpdate(
      {},
      { $set: { examPreparations: examData } },
      { upsert: true, new: true }
    );

    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error) {
    console.error('Error updating exam preparations:', error);
    throw new Error('Failed to update exam preparations');
  }
}

export async function updateApplicationDocuments(documentsData: ApplicationDocument[]): Promise<{ success: boolean }> {
  try {
    await connectDB();

    await HigherEducation.findOneAndUpdate(
      {},
      { $set: { applicationDocuments: documentsData } },
      { upsert: true, new: true }
    );

    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error) {
    console.error('Error updating application documents:', error);
    throw new Error('Failed to update application documents');
  }
}

export async function getAllStudentProgress(): Promise<StudentProgress[]> {
  try {
    await connectDB();

    const data = await HigherEducation.findOne()
      .populate('studentProgress.userId', 'name email college year')
      .lean();

    if (!data) {
      return [];
    }

    const dataAsAny = data as any;
    return serializeDocument(dataAsAny.studentProgress || []) as StudentProgress[];
  } catch (error) {
    console.error('Error fetching all student progress:', error);
    throw new Error('Failed to fetch student progress data');
  }
}
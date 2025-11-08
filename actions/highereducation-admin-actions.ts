'use server';

import { connectDB } from '@/lib/db';
import { HigherEducation } from '@/models/HigherEducation';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { 
  Country, 
  ExamPreparation, 
  ApplicationDocument, 
  StudentProgress,
  TA_RAGuideItem
} from '@/types/higher-education';

interface HigherEducationData {
  countries: Country[];
  examPreparations: ExamPreparation[];
  applicationDocuments: ApplicationDocument[];
  studentProgress: StudentProgress[];
  taRaGuides?: TA_RAGuideItem[];
}

// Define the database document interface
interface HigherEducationDocument {
  countries?: Country[];
  examPreparations?: ExamPreparation[];
  applicationDocuments?: ApplicationDocument[];
  studentProgress?: StudentProgress[];
  taRaGuides?: TA_RAGuideItem[];
  _id?: any;
  __v?: number;
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

// Create initial document if it doesn't exist
async function ensureInitialDocument() {
  try {
    const existingData = await HigherEducation.findOne();
    if (!existingData) {
      console.log('📝 Creating initial HigherEducation document...');
      const initialData = new HigherEducation({
        countries: [],
        examPreparations: [],
        applicationDocuments: [],
        studentProgress: [],
        taRaGuides: []
      });
      await initialData.save();
      console.log('✅ Initial document created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating initial document:', error);
    throw error;
  }
}

export async function getHigherEducationData(): Promise<HigherEducationData> {
  try {
    await connectDB();
    await ensureInitialDocument();
    
    const data = await HigherEducation.findOne().lean();

    if (!data) {
      throw new Error('No higher education data found after ensuring initial document');
    }

    // Cast to our document interface to fix TypeScript errors
    const dataAsDoc = data as unknown as HigherEducationDocument;

    console.log('📊 Loaded data counts:', {
      countries: dataAsDoc.countries?.length || 0,
      exams: dataAsDoc.examPreparations?.length || 0,
      documents: dataAsDoc.applicationDocuments?.length || 0,
      taRaGuides: dataAsDoc.taRaGuides?.length || 0
    });

    return serializeDocument({
      countries: dataAsDoc.countries || [],
      examPreparations: dataAsDoc.examPreparations || [],
      applicationDocuments: dataAsDoc.applicationDocuments || [],
      studentProgress: dataAsDoc.studentProgress || [],
      taRaGuides: dataAsDoc.taRaGuides || []
    }) as HigherEducationData;
  } catch (error) {
    console.error('❌ Error fetching higher education data:', error);
    return {
      countries: [],
      examPreparations: [],
      applicationDocuments: [],
      studentProgress: [],
      taRaGuides: []
    };
  }
}

export async function updateCountriesData(countriesData: Country[]): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await ensureInitialDocument();

    console.log('💾 Saving countries data:', countriesData.length);
    
    const result = await HigherEducation.findOneAndUpdate(
      {},
      { $set: { countries: countriesData } },
      { upsert: true, new: true, runValidators: true }
    );

    if (!result) {
      throw new Error('Failed to update countries data');
    }

    console.log('✅ Countries data saved successfully');
    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating countries data:', error);
    return { success: false, error: error.message };
  }
}

export async function updateExamPreparations(examData: ExamPreparation[]): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await ensureInitialDocument();

    console.log('💾 Saving exam preparations:', examData.length);
    
    const result = await HigherEducation.findOneAndUpdate(
      {},
      { $set: { examPreparations: examData } },
      { upsert: true, new: true, runValidators: true }
    );

    if (!result) {
      throw new Error('Failed to update exam preparations');
    }

    console.log('✅ Exam preparations saved successfully');
    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating exam preparations:', error);
    return { success: false, error: error.message };
  }
}

export async function updateApplicationDocuments(documentsData: ApplicationDocument[]): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await ensureInitialDocument();

    console.log('💾 Saving application documents:', documentsData.length);
    
    const result = await HigherEducation.findOneAndUpdate(
      {},
      { $set: { applicationDocuments: documentsData } },
      { upsert: true, new: true, runValidators: true }
    );

    if (!result) {
      throw new Error('Failed to update application documents');
    }

    console.log('✅ Application documents saved successfully');
    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating application documents:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTARAGuides(guides: TA_RAGuideItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await ensureInitialDocument();
    
    console.log('💼 Updating TA/RA guides:', guides.length);
    
    const result = await HigherEducation.findOneAndUpdate(
      {},
      { $set: { taRaGuides: guides } },
      { upsert: true, new: true, runValidators: true }
    );

    if (!result) {
      throw new Error('Failed to update TA/RA guides in database');
    }

    console.log('✅ TA/RA guides updated successfully');
    revalidatePath('/admin/highereducation');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating TA/RA guides:', error);
    return { success: false, error: error.message };
  }
}

export async function getStudentProgress(): Promise<StudentProgress[]> {
  try {
    await connectDB();
    await ensureInitialDocument();

    const data = await HigherEducation.findOne().lean();

    if (!data) {
      return [];
    }

    // Cast to our document interface
    const dataAsDoc = data as unknown as HigherEducationDocument;
    return serializeDocument(dataAsDoc.studentProgress || []) as StudentProgress[];
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return [];
  }
}

export async function getHigherEducationAdminData(): Promise<HigherEducationData> {
  try {
    await connectDB();
    await ensureInitialDocument();
    
    console.log('📊 Fetching higher education admin data...');
    
    const data = await HigherEducation.findOne().lean();

    if (!data) {
      console.log('❌ No higher education data found');
      return {
        countries: [],
        examPreparations: [],
        applicationDocuments: [],
        studentProgress: [],
        taRaGuides: []
      };
    }

    // Cast to our document interface
    const dataAsDoc = data as unknown as HigherEducationDocument;

    console.log('✅ Higher education admin data fetched successfully');
    return serializeDocument({
      countries: dataAsDoc.countries || [],
      examPreparations: dataAsDoc.examPreparations || [],
      applicationDocuments: dataAsDoc.applicationDocuments || [],
      studentProgress: dataAsDoc.studentProgress || [],
      taRaGuides: dataAsDoc.taRaGuides || []
    }) as HigherEducationData;
  } catch (error) {
    console.error('❌ Error fetching higher education admin data:', error);
    return {
      countries: [],
      examPreparations: [],
      applicationDocuments: [],
      studentProgress: [],
      taRaGuides: []
    };
  }
}
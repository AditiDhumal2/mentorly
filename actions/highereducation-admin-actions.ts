// actions/highereducation-admin-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { HigherEducation } from '@/models/HigherEducation';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

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

export async function getHigherEducationData() {
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

    return serializeDocument(data);
  } catch (error) {
    console.error('Error fetching higher education data:', error);
    throw new Error('Failed to fetch higher education data');
  }
}

export async function updateCountriesData(countriesData: any[]) {
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

export async function updateExamPreparations(examData: any[]) {
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

export async function updateApplicationDocuments(documentsData: any[]) {
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

export async function getAllStudentProgress() {
  try {
    await connectDB();

    const data = await HigherEducation.findOne()
      .populate('studentProgress.userId', 'name email college year')
      .lean();

    if (!data) {
      return [];
    }

    const higherEdData = data as any;
    return serializeDocument(higherEdData.studentProgress || []);
  } catch (error) {
    console.error('Error fetching all student progress:', error);
    throw new Error('Failed to fetch student progress data');
  }
}
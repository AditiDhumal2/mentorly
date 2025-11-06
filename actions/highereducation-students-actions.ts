// actions/highereducation-students-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { HigherEducation } from '@/models/HigherEducation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './userActions';
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
    
    console.log('📚 Fetching higher education data from database...');
    
    const data = await HigherEducation.findOne()
      .populate('studentProgress.userId')
      .lean();

    // Use type assertion to bypass TypeScript strict checking
    const dataAsAny = data as any;

    console.log('✅ Higher education data found:', {
      countries: dataAsAny?.countries?.length || 0,
      exams: dataAsAny?.examPreparations?.length || 0,
      documents: dataAsAny?.applicationDocuments?.length || 0,
      progress: dataAsAny?.studentProgress?.length || 0
    });

    if (!dataAsAny) {
      console.log('❌ No higher education data found, returning empty structure');
      return {
        countries: [],
        examPreparations: [],
        applicationDocuments: [],
        studentProgress: []
      };
    }

    // Return the serialized data with proper structure
    return serializeDocument({
      countries: dataAsAny.countries || [],
      examPreparations: dataAsAny.examPreparations || [],
      applicationDocuments: dataAsAny.applicationDocuments || [],
      studentProgress: dataAsAny.studentProgress || []
    });
  } catch (error) {
    console.error('❌ Error fetching higher education data:', error);
    throw new Error('Failed to fetch higher education data');
  }
}

export async function getStudentProgress() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('👤 Fetching student progress for user:', user._id);
    
    await connectDB();
    
    const higherEdData = await HigherEducation.findOne({
      'studentProgress.userId': user._id
    });

    if (!higherEdData) {
      console.log('📝 Creating initial progress for student:', user._id);
      
      const initialProgress = {
        userId: new mongoose.Types.ObjectId(user._id),
        currentStep: 1,
        completedSteps: [],
        examScores: {},
        applications: [],
        documents: [
          { 
            type: 'sop', 
            name: 'Statement of Purpose', 
            status: 'not_started', 
            lastUpdated: new Date(),
            _id: new mongoose.Types.ObjectId()
          },
          { 
            type: 'lor', 
            name: 'Letters of Recommendation', 
            status: 'not_started', 
            lastUpdated: new Date(),
            _id: new mongoose.Types.ObjectId()
          },
          { 
            type: 'cv', 
            name: 'Curriculum Vitae', 
            status: 'not_started', 
            lastUpdated: new Date(),
            _id: new mongoose.Types.ObjectId()
          },
          { 
            type: 'transcripts', 
            name: 'Academic Transcripts', 
            status: 'not_started', 
            lastUpdated: new Date(),
            _id: new mongoose.Types.ObjectId()
          }
        ],
        timeline: [
          { 
            step: 'Research Countries & Universities', 
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
            completed: false,
            important: true,
            _id: new mongoose.Types.ObjectId()
          },
          { 
            step: 'Prepare for Exams (GRE/IELTS/TOEFL)', 
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 
            completed: false,
            important: true,
            _id: new mongoose.Types.ObjectId()
          },
          { 
            step: 'Prepare Application Documents', 
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
            completed: false,
            important: true,
            _id: new mongoose.Types.ObjectId()
          },
          { 
            step: 'Submit Applications', 
            deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), 
            completed: false,
            important: true,
            _id: new mongoose.Types.ObjectId()
          }
        ],
        profileStrength: 25,
        targetUniversities: [],
        _id: new mongoose.Types.ObjectId()
      };

      const result = await HigherEducation.findOneAndUpdate(
        {},
        { $push: { studentProgress: initialProgress } },
        { upsert: true, new: true }
      );

      console.log('✅ Initial progress created for student');
      return serializeDocument(initialProgress);
    }

    const progress = higherEdData.studentProgress.find(
      (p: any) => p.userId.toString() === user._id
    );

    console.log('✅ Student progress found:', {
      currentStep: progress?.currentStep,
      completedSteps: progress?.completedSteps?.length,
      documents: progress?.documents?.length
    });

    return serializeDocument(progress) || null;
  } catch (error) {
    console.error('❌ Error fetching student progress:', error);
    throw new Error('Failed to fetch student progress');
  }
}

export async function updateProgressStep(stepNumber: number, completed: boolean) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('🔄 Updating progress step:', { stepNumber, completed, userId: user._id });

    await connectDB();

    if (completed) {
      await HigherEducation.findOneAndUpdate(
        { 'studentProgress.userId': user._id },
        { 
          $addToSet: { 'studentProgress.$.completedSteps': stepNumber },
          $set: { 'studentProgress.$.currentStep': stepNumber + 1 }
        }
      );
    } else {
      await HigherEducation.findOneAndUpdate(
        { 'studentProgress.userId': user._id },
        { 
          $pull: { 'studentProgress.$.completedSteps': stepNumber }
        }
      );
    }

    revalidatePath('/students/highereducation');
    console.log('✅ Progress step updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating progress step:', error);
    throw new Error('Failed to update progress');
  }
}

export async function saveExamScores(scores: any) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('💾 Saving exam scores for user:', user._id);

    await connectDB();

    await HigherEducation.findOneAndUpdate(
      { 'studentProgress.userId': user._id },
      { $set: { 'studentProgress.$.examScores': scores } }
    );

    revalidatePath('/students/highereducation');
    console.log('✅ Exam scores saved successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving exam scores:', error);
    throw new Error('Failed to save exam scores');
  }
}

export async function updateDocumentStatus(documentType: string, status: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('📄 Updating document status:', { documentType, status, userId: user._id });

    await connectDB();

    await HigherEducation.findOneAndUpdate(
      { 
        'studentProgress.userId': user._id,
        'studentProgress.documents.type': documentType
      },
      { 
        $set: { 
          'studentProgress.$.documents.$[doc].status': status,
          'studentProgress.$.documents.$[doc].lastUpdated': new Date()
        }
      },
      { arrayFilters: [{ 'doc.type': documentType }] }
    );

    revalidatePath('/students/highereducation');
    console.log('✅ Document status updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating document status:', error);
    throw new Error('Failed to update document status');
  }
}

export async function addUniversityApplication(applicationData: any) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('🏛️ Adding university application for user:', user._id);

    await connectDB();

    const newApplication = {
      ...applicationData,
      _id: new mongoose.Types.ObjectId()
    };

    await HigherEducation.findOneAndUpdate(
      { 'studentProgress.userId': user._id },
      { $push: { 'studentProgress.$.applications': newApplication } }
    );

    revalidatePath('/students/highereducation');
    console.log('✅ University application added successfully');
    return { success: true, application: serializeDocument(newApplication) };
  } catch (error) {
    console.error('❌ Error adding university application:', error);
    throw new Error('Failed to add application');
  }
}
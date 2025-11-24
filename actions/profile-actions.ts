// actions/profile-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';
import { cloudinary } from '@/lib/cloudinary';

// Convert file to base64 for Cloudinary upload
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function uploadProfilePhotoAction(
  userId: string,
  userRole: 'student' | 'mentor',
  formData: FormData
): Promise<{ success: boolean; error?: string; imageUrl?: string }> {
  try {
    console.log('🖼️ Starting profile photo upload for:', { userId, userRole });
    
    const file = formData.get('profilePhoto') as File;
    
    if (!file) {
      console.log('❌ No file provided');
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      return { success: false, error: 'Please upload an image file (JPEG, PNG, GIF)' };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return { success: false, error: 'Image size should be less than 5MB' };
    }

    console.log('📤 Converting file to base64...');
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);
    const dataUri = `data:${file.type};base64,${base64String}`;

    console.log('📤 Uploading to Cloudinary...');
    console.log('📤 File info:', {
      name: file.name,
      type: file.type,
      size: file.size,
      userId,
      userRole
    });

    // Upload to Cloudinary with timeout
    const uploadPromise = cloudinary.uploader.upload(dataUri, {
      folder: 'mentorly/profiles',
      public_id: `${userRole}_${userId}`,
      overwrite: true,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout')), 30000);
    });

    const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;

    console.log('✅ Cloudinary upload successful:', {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    });

    await connectDB();

    // Update user with Cloudinary URL
    if (userRole === 'student') {
      await Student.findByIdAndUpdate(userId, { 
        profilePhoto: uploadResult.secure_url 
      });
      console.log('✅ Profile photo updated for student:', userId);
    } else if (userRole === 'mentor') {
      await Mentor.findByIdAndUpdate(userId, { 
        profilePhoto: uploadResult.secure_url 
      });
      console.log('✅ Profile photo updated for mentor:', userId);
    }

    // Revalidate relevant paths
    revalidatePath('/students');
    revalidatePath('/mentors/dashboard');
    revalidatePath('/profile');
    revalidatePath('/messages');

    console.log('🎉 Profile photo upload completed successfully');
    
    return { 
      success: true, 
      imageUrl: uploadResult.secure_url 
    };
  } catch (error: any) {
    console.error('❌ Error uploading profile photo:', error);
    
    // Detailed error handling
    if (error.http_code === 401) {
      console.error('❌ Cloudinary authentication failed - check credentials');
      return { 
        success: false, 
        error: 'Cloudinary authentication failed. Please check your credentials.' 
      };
    }
    
    if (error.message.includes('Invalid cloud_name')) {
      console.error('❌ Invalid Cloudinary cloud name');
      return { 
        success: false, 
        error: 'Invalid Cloudinary configuration. Please check your cloud name.' 
      };
    }
    
    if (error.message.includes('Upload timeout')) {
      console.error('❌ Upload timeout');
      return { 
        success: false, 
        error: 'Upload timed out. Please try again.' 
      };
    }
    
    if (error.message.includes('File size too large')) {
      return { success: false, error: 'File size too large. Please choose a smaller image.' };
    }
    
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      error: `Failed to upload profile photo: ${error.message}` 
    };
  }
}

// Delete profile photo from Cloudinary
export async function deleteProfilePhotoAction(
  userId: string,
  userRole: 'student' | 'mentor'
): Promise<{ success: boolean; error?: string }> {
  try {
    const publicId = `mentorly/profiles/${userRole}_${userId}`;

    console.log('🗑️ Deleting from Cloudinary:', publicId);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('✅ Cloudinary deletion result:', result);

    await connectDB();

    // Remove profile photo from user record
    if (userRole === 'student') {
      await Student.findByIdAndUpdate(userId, { $unset: { profilePhoto: 1 } });
      console.log('✅ Profile photo removed for student:', userId);
    } else if (userRole === 'mentor') {
      await Mentor.findByIdAndUpdate(userId, { $unset: { profilePhoto: 1 } });
      console.log('✅ Profile photo removed for mentor:', userId);
    }

    // Revalidate relevant paths
    revalidatePath('/students');
    revalidatePath('/mentors/dashboard');
    revalidatePath('/profile');

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error deleting profile photo:', error);
    return { success: false, error: 'Failed to delete profile photo' };
  }
}

// Test Cloudinary connection
export async function testCloudinaryConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('🔍 Testing Cloudinary connection...');
    
    // Simple test upload with a small SVG
    const testImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM3OTBGRiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9LPC90ZXh0Pjwvc3ZnPg==';
    
    const result = await cloudinary.uploader.upload(testImage, {
      folder: 'mentorly/tests',
      public_id: `connection_test_${Date.now()}`,
      overwrite: true
    });
    
    console.log('✅ Cloudinary connection test successful:', result);
    
    // Clean up test image
    await cloudinary.uploader.destroy(result.public_id);
    
    return { 
      success: true, 
      details: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
        upload_worked: true
      }
    };
  } catch (error: any) {
    console.error('❌ Cloudinary connection test failed:', error);
    return { 
      success: false, 
      error: `Cloudinary connection failed: ${error.message}`,
      details: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
        error_code: error.http_code,
        error_message: error.message
      }
    };
  }
}
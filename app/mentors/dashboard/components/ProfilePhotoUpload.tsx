// app/mentors/dashboard/components/ProfilePhotoUpload.tsx
'use client';

import { useState } from 'react';
import { uploadProfilePhotoAction } from '@/actions/profile-actions';
import { Mentor } from '@/types';

interface ProfilePhotoUploadProps {
  mentor: Mentor;
  onPhotoUpdate: (imageUrl: string) => void;
}

export default function ProfilePhotoUpload({ mentor, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const result = await uploadProfilePhotoAction(mentor._id, 'mentor', formData);

      if (result.success && result.imageUrl) {
        setUploadMessage('Profile photo saved successfully!');
        onPhotoUpdate(result.imageUrl);
      } else {
        setUploadMessage(result.error || 'Failed to save photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadMessage('Error saving photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          {mentor.profilePhoto ? (
            <img 
              src={mentor.profilePhoto} 
              alt={mentor.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
              {mentor.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mentor.profilePhoto ? 'Change Profile Photo' : 'Upload Profile Photo'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>

            {uploading && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Uploading to cloud...</span>
              </div>
            )}

            {uploadMessage && (
              <p className={`text-sm ${uploadMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {uploadMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
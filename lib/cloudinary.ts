// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Log configuration for debugging
console.log('🔧 Loading Cloudinary configuration...');
console.log('🔧 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('🔧 API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('🔧 API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');

// Validate environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  const missing = [];
  if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missing.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
  
  throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
}

console.log('✅ Cloudinary Config Loaded Successfully');

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// Test the configuration
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection test passed:', result);
  })
  .catch(error => {
    console.error('❌ Cloudinary connection test failed:', error);
  });

export { cloudinary };
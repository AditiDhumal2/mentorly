import { Types } from 'mongoose';

// Base resource interface
export interface ResourceBase {
  title: string;
  description: string;
  url: string;
  type: 'course' | 'internship' | 'portal' | 'newsletter';
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  free: boolean;
  certificate: boolean;
}

// Rating interface
export interface ResourceRating {
  userId: Types.ObjectId;
  rating: number;
}

// Full resource interface with MongoDB fields
export interface Resource extends ResourceBase {
  _id: Types.ObjectId;
  rating?: number;
  ratedBy: ResourceRating[];
  addedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// For creating new resources
export interface CreateResourceInput extends ResourceBase {
  // No additional fields needed
}

// For updating resources
export interface UpdateResourceInput extends Partial<ResourceBase> {
  // Partial makes all fields optional
}

// For API responses
export interface ResourceResponse extends ResourceBase {
  _id: string;
  addedBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// For form data
export interface ResourceFormData {
  title: string;
  description: string;
  url: string;
  type: 'course' | 'internship' | 'portal' | 'newsletter';
  tags: string; // Comma-separated string for form input
  level: 'beginner' | 'intermediate' | 'advanced';
  free: boolean;
  certificate: boolean;
}

// Filter types
export interface ResourceFilters {
  type: string;
  level: string;
  free: string;
  tags: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ResourcesResponse extends ApiResponse<ResourceResponse[]> {
  resources?: ResourceResponse[];
}

export interface ResourceResponseSingle extends ApiResponse<ResourceResponse> {
  resource?: ResourceResponse;
}
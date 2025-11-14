'use client';

import { Mentor } from '@/types/mentor-selection';
import { Star, MapPin, Briefcase, Clock, Users } from 'lucide-react';

interface MentorCardProps {
  mentor: Mentor;
  onSelect: (mentor: Mentor) => void;
}

export default function MentorCard({ mentor, onSelect }: MentorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{mentor.name}</h3>
              <p className="text-gray-600 text-sm">{mentor.qualification}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-yellow-700">
              {mentor.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* College */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{mentor.college}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <Briefcase className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">{mentor.experience} years</p>
          </div>
          <div className="text-center">
            <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">{mentor.studentsHelped} students</p>
          </div>
          <div className="text-center">
            <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">{mentor.responseTime}h response</p>
          </div>
        </div>

        {/* Expertise */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
          <div className="flex flex-wrap gap-1">
            {mentor.expertise.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{mentor.expertise.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {mentor.bio || 'Experienced mentor dedicated to student success.'}
        </p>

        {/* Action */}
        <button
          onClick={() => onSelect(mentor)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
        >
          Request Session
        </button>
      </div>
    </div>
  );
}
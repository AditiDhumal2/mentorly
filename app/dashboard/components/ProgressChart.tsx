'use client';

import { useEffect, useState } from 'react';

interface ProgressChartProps {
  roadmapProgress: number;
  brandingProgress: number;
}

export default function ProgressChart({ roadmapProgress, brandingProgress }: ProgressChartProps) {
  const [animatedRoadmap, setAnimatedRoadmap] = useState(0);
  const [animatedBranding, setAnimatedBranding] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRoadmap(roadmapProgress);
      setAnimatedBranding(brandingProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [roadmapProgress, brandingProgress]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-blue-500 mr-2">📈</span>
        Progress Overview
      </h2>
      
      <div className="space-y-6">
        {/* Roadmap Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Learning Roadmap</span>
            <span className="text-sm font-bold text-blue-600">{animatedRoadmap}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedRoadmap}%` }}
            ></div>
          </div>
        </div>

        {/* Branding Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Professional Branding</span>
            <span className="text-sm font-bold text-green-600">{animatedBranding}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedBranding}%` }}
            ></div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-blue-600 font-medium">Goals Set</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs text-green-600 font-medium">In Progress</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xs text-purple-600 font-medium">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
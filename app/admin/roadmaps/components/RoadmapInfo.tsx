// app/admin/roadmap/components/RoadmapInfo.tsx
'use client';

import { Language } from '@/lib/languages';

interface RoadmapInfoProps {
  roadmap: any;
  selectedLanguage: string;
  languages: Language[];
}

export default function RoadmapInfo({ roadmap, selectedLanguage, languages }: RoadmapInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {roadmap.title} - {languages.find(l => l.id === selectedLanguage)?.name}
      </h2>
      <p className="text-gray-600">{roadmap.description}</p>
    </div>
  );
}
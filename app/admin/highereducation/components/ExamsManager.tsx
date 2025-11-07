// app/admin/highereducation/components/ExamsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { updateExamPreparations } from '@/actions/highereducation-admin-actions';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Snackbar from '@/components/Snackbar';
import { ExamPreparation, ExamsManagerProps, StudyWeek, StudyResource } from '@/types/higher-education';

export default function ExamsManager({ exams }: ExamsManagerProps) {
  const [localExams, setLocalExams] = useState<ExamPreparation[]>(exams);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingExam, setEditingExam] = useState<ExamPreparation | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; examId: string | null; examName: string }>({
    isOpen: false,
    examId: null,
    examName: ''
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      await updateExamPreparations(localExams);
      setMessage({ type: 'success', text: 'Exam preparations saved successfully!' });
      showSnackbar('Exam preparations saved successfully!', 'success');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save data. Please try again.' });
      showSnackbar('Failed to save data. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExam = () => {
    const newExam: ExamPreparation = {
      _id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      examType: 'new-exam',
      studyPlan: [
        {
          week: 1,
          topics: ['New topic 1', 'New topic 2'],
          resources: [
            {
              title: 'New Resource',
              url: '',
              type: 'online_course'
            }
          ]
        }
      ],
      recommendedScore: {
        minimum: 0,
        competitive: 0
      },
      testCenters: ['New test center'],
      registrationLink: ''
    };
    setLocalExams(prev => [...prev, newExam]);
    showSnackbar('New exam added successfully!', 'success');
  };

  const handleDeleteExam = (examId: string) => {
    const exam = localExams.find(e => e._id === examId);
    setDeleteModal({
      isOpen: true,
      examId,
      examName: getExamDisplayName(exam?.examType || '')
    });
  };

  const confirmDeleteExam = () => {
    if (deleteModal.examId) {
      setLocalExams(prev => prev.filter(exam => exam._id !== deleteModal.examId));
      setDeleteModal({ isOpen: false, examId: null, examName: '' });
      showSnackbar('Exam deleted successfully!', 'success');
    }
  };

  const handleUpdateExam = (updatedExam: ExamPreparation) => {
    setLocalExams(prev => prev.map(exam => 
      exam._id === updatedExam._id ? updatedExam : exam
    ));
    setEditingExam(null);
    showSnackbar('Exam updated successfully!', 'success');
  };

  const getExamDisplayName = (examType: string): string => {
    const examNames: { [key: string]: string } = {
      gre: 'GRE',
      ielts: 'IELTS',
      toefl: 'TOEFL',
      gmat: 'GMAT'
    };
    return examNames[examType] || examType.toUpperCase();
  };

  const getExamColor = (examType: string): string => {
    const colors: { [key: string]: string } = {
      gre: 'red',
      ielts: 'blue',
      toefl: 'green',
      gmat: 'purple'
    };
    return colors[examType] || 'gray';
  };

  // Generate a stable key for each exam
  const getExamKey = (exam: ExamPreparation, index: number): string => {
    return exam._id || `exam-${index}-${exam.examType}`;
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Exam Preparations</h3>
          <p className="text-gray-600 text-sm mt-1">
            Manage GRE, IELTS, TOEFL, and other exam preparation materials
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddExam}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            type="button"
          >
            Add Exam
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localExams.map((exam, index) => (
          <div key={getExamKey(exam, index)} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 text-lg">
                {getExamDisplayName(exam.examType)}
              </h4>
              <span className={`px-3 py-1 text-xs rounded-full bg-${getExamColor(exam.examType)}-100 text-${getExamColor(exam.examType)}-800`}>
                {exam.examType.toUpperCase()}
              </span>
            </div>

            {/* Recommended Scores */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Recommended Scores</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded p-2">
                  <span className="text-gray-600">Minimum:</span>
                  <div className="font-semibold">{exam.recommendedScore?.minimum || 'N/A'}</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <span className="text-gray-600">Competitive:</span>
                  <div className="font-semibold text-green-700">{exam.recommendedScore?.competitive || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Study Plan Overview */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Study Plan ({exam.studyPlan?.length || 0} weeks)</h5>
              {exam.studyPlan?.slice(0, 2).map((week: StudyWeek, weekIndex: number) => (
                <div key={`week-${weekIndex}-${week.week}`} className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Week {week.week}:</span> {week.topics?.slice(0, 2).join(', ')}
                </div>
              ))}
              {exam.studyPlan && exam.studyPlan.length > 2 && (
                <div className="text-sm text-gray-500">+{exam.studyPlan.length - 2} more weeks...</div>
              )}
            </div>

            {/* Test Centers */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Test Centers</h5>
              <div className="text-sm text-gray-600">
                {exam.testCenters?.slice(0, 2).map((center: string, idx: number) => (
                  <div key={`center-${idx}-${center.substring(0, 10)}`}>• {center}</div>
                ))}
                {exam.testCenters && exam.testCenters.length > 2 && (
                  <div className="text-gray-500">+{exam.testCenters.length - 2} more centers</div>
                )}
              </div>
            </div>

            {/* Registration Link */}
            {exam.registrationLink && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={exam.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors text-center block mb-2"
                >
                  Register for {getExamDisplayName(exam.examType)}
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditingExam(exam)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteExam(exam._id)}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {localExams.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exams Added</h3>
          <p className="text-gray-600 mb-4">Start by adding exam preparation materials for GRE, IELTS, TOEFL, etc.</p>
          <button
            onClick={handleAddExam}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            Add First Exam
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingExam && (
        <ExamEditModal
          exam={editingExam}
          onSave={handleUpdateExam}
          onClose={() => setEditingExam(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, examId: null, examName: '' })}
        onConfirm={confirmDeleteExam}
        title="Delete Exam"
        message={`Are you sure you want to delete ${deleteModal.examName} preparation? This action cannot be undone.`}
        confirmText="Delete Exam"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// Exam Edit Modal Component
interface ExamEditModalProps {
  exam: ExamPreparation;
  onSave: (exam: ExamPreparation) => void;
  onClose: () => void;
}

function ExamEditModal({ exam, onSave, onClose }: ExamEditModalProps) {
  const [formData, setFormData] = useState<ExamPreparation>(exam);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof ExamPreparation, value: any) => {
    setFormData((prev: ExamPreparation) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof ExamPreparation, field: string, value: any) => {
    setFormData((prev: ExamPreparation) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const addStudyWeek = () => {
    const newWeek: StudyWeek = {
      week: (formData.studyPlan?.length || 0) + 1,
      topics: ['New topic'],
      resources: [
        {
          title: 'New Resource',
          url: '',
          type: 'online_course'
        }
      ]
    };
    setFormData((prev: ExamPreparation) => ({
      ...prev,
      studyPlan: [...(prev.studyPlan || []), newWeek]
    }));
  };

  const removeStudyWeek = (index: number) => {
    setFormData((prev: ExamPreparation) => ({
      ...prev,
      studyPlan: (prev.studyPlan || []).filter((_, i) => i !== index)
    }));
  };

  const updateStudyWeek = (index: number, field: keyof StudyWeek, value: any) => {
    const newStudyPlan = [...(formData.studyPlan || [])];
    newStudyPlan[index] = {
      ...newStudyPlan[index],
      [field]: value
    };
    handleChange('studyPlan', newStudyPlan);
  };

  const addTestCenter = () => {
    setFormData((prev: ExamPreparation) => ({
      ...prev,
      testCenters: [...(prev.testCenters || []), 'New Test Center']
    }));
  };

  const removeTestCenter = (index: number) => {
    setFormData((prev: ExamPreparation) => ({
      ...prev,
      testCenters: (prev.testCenters || []).filter((_, i) => i !== index)
    }));
  };

  const getExamDisplayName = (examType: string): string => {
    const examNames: { [key: string]: string } = {
      gre: 'GRE',
      ielts: 'IELTS',
      toefl: 'TOEFL',
      gmat: 'GMAT'
    };
    return examNames[examType] || examType.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Edit {getExamDisplayName(exam.examType)} Preparation</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
              <select
                value={formData.examType}
                onChange={(e) => handleChange('examType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gre">GRE</option>
                <option value="ielts">IELTS</option>
                <option value="toefl">TOEFL</option>
                <option value="gmat">GMAT</option>
                <option value="new-exam">Other Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Link</label>
              <input
                type="url"
                value={formData.registrationLink || ''}
                onChange={(e) => handleChange('registrationLink', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/register"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Score</label>
              <input
                type="number"
                value={formData.recommendedScore?.minimum || ''}
                onChange={(e) => handleNestedChange('recommendedScore', 'minimum', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Competitive Score</label>
              <input
                type="number"
                value={formData.recommendedScore?.competitive || ''}
                onChange={(e) => handleNestedChange('recommendedScore', 'competitive', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Test Centers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Test Centers ({(formData.testCenters || []).length})</h4>
              <button
                type="button"
                onClick={addTestCenter}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Test Center
              </button>
            </div>
            <div className="space-y-2">
              {(formData.testCenters || []).map((center: string, index: number) => (
                <div key={`test-center-${index}-${center.substring(0, 10)}`} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={center}
                    onChange={(e) => {
                      const newCenters = [...(formData.testCenters || [])];
                      newCenters[index] = e.target.value;
                      handleChange('testCenters', newCenters);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTestCenter(index)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Study Plan */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Study Plan ({(formData.studyPlan || []).length} weeks)</h4>
              <button
                type="button"
                onClick={addStudyWeek}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Week
              </button>
            </div>
            <div className="space-y-4">
              {(formData.studyPlan || []).map((week: StudyWeek, index: number) => (
                <div key={`study-week-${index}-${week.week}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">Week {week.week}</h5>
                    <button
                      type="button"
                      onClick={() => removeStudyWeek(index)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                      <input
                        type="number"
                        value={week.week}
                        onChange={(e) => updateStudyWeek(index, 'week', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                      <textarea
                        value={week.topics?.join(', ') || ''}
                        onChange={(e) => updateStudyWeek(index, 'topics', e.target.value.split(',').map((t: string) => t.trim()))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Topic 1, Topic 2, Topic 3"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
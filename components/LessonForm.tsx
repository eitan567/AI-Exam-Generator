
import React, { useState } from 'react';
import type { ExamFormData, Exam } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import PaperClipIcon from './icons/PaperClipIcon';
import TrashIcon from './icons/TrashIcon';

interface ExamFormProps {
  onSubmit: (formData: ExamFormData) => void;
  isLoading: boolean;
  error?: string | null;
  initialData?: Exam | null;
}

const defaultFormData: ExamFormData = {
  title: '',
  // FIX: Changed property 'file' to 'files' to match ExamFormData type.
  files: [],
  duration: '60',
  numSingleChoice: '5',
  numMultipleChoice: '3',
  numOpenEnded: '2',
};

const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, isLoading, error, initialData }) => {
  const [formData, setFormData] = useState<ExamFormData>(initialData ? {
      id: initialData.id,
      title: initialData.title,
      // FIX: Changed property 'file' to 'files' to match ExamFormData type.
      files: [], // User must re-upload file for editing/regeneration
      duration: String(initialData.duration),
      numSingleChoice: String(initialData.questions.filter(q => q.type === 'single-choice').length),
      numMultipleChoice: String(initialData.questions.filter(q => q.type === 'multiple-choice').length),
      numOpenEnded: String(initialData.questions.filter(q => q.type === 'open-ended').length),
  } : defaultFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("הקובץ גדול מדי. הגודל המקסימלי הוא 10MB.");
      return;
    }
    // FIX: Changed property 'file' to 'files' and wrapped the file in an array.
    setFormData(prev => ({ ...prev, files: file ? [file] : [], title: initialData?.title || file?.name.split('.').slice(0, -1).join('.') || '' }));
  };

  const handleRemoveFile = () => {
    // FIX: Changed property 'file' to 'files'.
    setFormData(prev => ({ ...prev, files: [] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // FIX: Changed property 'file' to 'files' and checked its length.
    if (formData.files.length === 0 && !initialData) {
        alert("יש להעלות קובץ חומר לימוד.");
        return;
    }
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <div className="flex-grow">
      <div className="rounded-2xl max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{isEditing ? 'עריכת מבחן' : 'יצירת מבחן חדש'}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">העלו חומר לימוד, הגדירו את מבנה המבחן, וה-AI יעשה את השאר.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 text-center">
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <fieldset className="space-y-6">
                <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">שלב 1: העלאת חומר לימוד <span className="text-red-500">*</span></label>
                    {/* FIX: Changed property 'file' to 'files' and checked its length. */}
                    {formData.files.length > 0 ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg">
                            {/* FIX: Changed property 'file' to 'files' and accessed the first element. */}
                            <span className="text-gray-700 dark:text-gray-200 truncate font-medium">{formData.files[0].name}</span>
                            <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <>
                            <label htmlFor="file-upload" className="cursor-pointer w-full flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-zinc-800 transition-colors">
                                <PaperClipIcon className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2" />
                                <span className="text-gray-700 dark:text-gray-300 font-semibold">לחצו לבחירת קובץ</span>
                                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">PDF, DOCX. מקסימום 10MB.</p>
                            </label>
                            <input id="file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                        </>
                    )}
                    {/* FIX: Changed property 'file' to 'files' and checked its length. */}
                    {isEditing && formData.files.length === 0 && <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">שימו לב: יש להעלות את הקובץ מחדש כדי ליצור שאלות חדשות.</p>}
                </div>

                <div>
                    <label htmlFor="title" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">כותרת המבחן</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100" placeholder="למשל: מבחן מסכם - המהפכה הצרפתית" />
                </div>
            </fieldset>

            <fieldset>
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">שלב 2: הגדרת מבנה המבחן</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label htmlFor="numSingleChoice" className="block font-medium text-gray-600 dark:text-gray-300 mb-1.5">שאלות אמריקאיות (יחיד)</label>
                        <input type="number" id="numSingleChoice" name="numSingleChoice" value={formData.numSingleChoice} onChange={handleChange} min="0" max="20" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"/>
                    </div>
                     <div>
                        <label htmlFor="numMultipleChoice" className="block font-medium text-gray-600 dark:text-gray-300 mb-1.5">שאלות אמריקאיות (מרובה)</label>
                        <input type="number" id="numMultipleChoice" name="numMultipleChoice" value={formData.numMultipleChoice} onChange={handleChange} min="0" max="20" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"/>
                    </div>
                     <div>
                        <label htmlFor="numOpenEnded" className="block font-medium text-gray-600 dark:text-gray-300 mb-1.5">שאלות פתוחות</label>
                        <input type="number" id="numOpenEnded" name="numOpenEnded" value={formData.numOpenEnded} onChange={handleChange} min="0" max="20" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"/>
                    </div>
                    <div>
                        <label htmlFor="duration" className="block font-medium text-gray-600 dark:text-gray-300 mb-1.5">זמן (דקות)</label>
                        <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} min="10" max="180" step="5" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"/>
                    </div>
                </div>
            </fieldset>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-cta w-full flex items-center justify-center px-6 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'יוצר מחדש...' : 'יוצר מבחן...'}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6 ml-3" />
                    {isEditing ? 'צור גרסה חדשה' : 'צור לי מבחן חכם'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamForm;
import React, { useState } from 'react';
import type { Exam, Student } from '../types';
import XIcon from './icons/XIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  students: Student[];
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, exam, students }) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="div-cta rounded-2xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-6 flex flex-col max-h-[90vh]">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10">
                        <XIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <CheckBadgeIcon className="w-8 h-8 text-green-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">המבחן פורסם בהצלחה!</h2>
                            <p className="text-gray-600 dark:text-gray-300">שתפו את הקודים הבאים עם התלמידים שלכם.</p>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">התלמידים יצטרכו להזין את תעודת הזהות שלהם ואת קוד המבחן הייעודי כדי להתחיל.</p>
                    
                    <div className="overflow-y-auto flex-grow pr-2">
                        <div className="space-y-3">
                            {students.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{student.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">כיתה: {student.class} &bull; ת.ז: {student.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-lg font-bold text-pink-600 dark:text-pink-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded">
                                            {exam.accessCodes?.[student.id] || '---'}
                                        </span>
                                        <button 
                                            onClick={() => handleCopy(exam.accessCodes?.[student.id] || '')}
                                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg"
                                        >
                                            {copiedCode === exam.accessCodes?.[student.id] 
                                                ? <CheckIcon className="w-5 h-5 text-green-500" /> 
                                                : <ClipboardIcon className="w-5 h-5" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-gray-200 dark:border-zinc-800">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-2.5 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700"
                        >
                            סגור
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishModal;
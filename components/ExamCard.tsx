import React from 'react';
import type { Exam } from '../types';
import ClockIcon from './icons/ClockIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import KeyIcon from './icons/KeyIcon';

interface ExamCardProps {
    exam: Exam;
    onSelect: (exam: Exam) => void;
    onDelete: (examId: string) => void;
    onPublish: (examId: string) => void;
    onEdit: (exam: Exam) => void;
    onShowCodes: (exam: Exam) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onSelect, onDelete, onPublish, onEdit, onShowCodes }) => {
    const statusColor = exam.status === 'פורסם' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div 
            className="div-cta rounded-xl h-full"
            onClick={() => onSelect(exam)}
        >
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 pr-2">{exam.title}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor}`}>
                            {exam.status}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4">
                        <div className="flex items-center">
                           <ClipboardDocCheckIcon className="w-4 h-4 ml-1.5" />
                           <span>{exam.questions.length} שאלות</span>
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 ml-1.5" />
                            <span>{exam.duration} דקות</span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-4 flex items-center justify-between">
                     <p className="text-xs text-gray-400 dark:text-gray-500">נוצר: {new Date(exam.creationDate).toLocaleDateString('he-IL')}</p>
                    <div className="flex items-center space-x-1 space-x-reverse">
                        {exam.status === 'טיוטה' && (
                            <button 
                                onClick={(e) => handleActionClick(e, () => onPublish(exam.id))}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                title="פרסם מבחן והנפק קודים לתלמידים"
                            >
                                <CheckBadgeIcon className="w-4 h-4" />
                                פרסם
                            </button>
                        )}
                         {exam.status === 'פורסם' && (
                            <button 
                                onClick={(e) => handleActionClick(e, () => onShowCodes(exam))}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                title="הצג קודים"
                            >
                                <KeyIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={(e) => handleActionClick(e, () => onEdit(exam))}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            title="ערוך מבחן"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => handleActionClick(e, () => onDelete(exam.id))}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            title="מחק מבחן"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamCard;

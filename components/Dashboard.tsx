
import React, { useState } from 'react';
import type { Exam } from '../types';
import ExamCard from './ExamCard';
import PlusIcon from './icons/PlusIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import ChartBarIcon from './icons/ChartBarIcon';

interface DashboardProps {
    exams: Exam[];
    onSelectExam: (exam: Exam) => void;
    onCreateNew: () => void;
    onDelete: (examId: string) => void;
    onPublish: (examId: string) => void;
    onEdit: (exam: Exam) => void;
    onNavigate: (view: 'students' | 'resultsDashboard') => void;
    onShowCodes: (exam: Exam) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    exams,
    onSelectExam,
    onCreateNew,
    onDelete,
    onPublish,
    onEdit,
    onNavigate,
    onShowCodes
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, draft, published

    const filteredExams = exams.filter(exam => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        // FIX: Changed property 'sourceFileName' to 'sourceFileNames' and adjusted search logic.
        const matchesSearch = exam.title.toLowerCase().includes(lowerSearchTerm) || 
                              (exam.sourceFileNames && exam.sourceFileNames.join(', ').toLowerCase().includes(lowerSearchTerm));
        
        const matchesFilter = filter === 'all' || 
                              (filter === 'draft' && exam.status === 'טיוטה') ||
                              (filter === 'published' && exam.status === 'פורסם');

        return matchesSearch && matchesFilter;
    });

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">לוח בקרה</h2>
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => onNavigate('students')}
                        className="btn-cta flex items-center gap-2 px-4 py-2 text-black dark:text-white font-semibold rounded-full transition-colors"
                    >
                        <UserGroupIcon className="w-5 h-5" />
                        ניהול תלמידים
                    </button>
                    <button
                        onClick={() => onNavigate('resultsDashboard')}
                        className="btn-cta flex items-center gap-2 px-4 py-2 text-black dark:text-white font-semibold rounded-full transition-colors"
                    >
                        <ChartBarIcon className="w-5 h-5" />
                        תוצאות מבחנים
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="btn-cta flex items-center gap-2 px-4 py-2 text-black dark:text-white font-semibold rounded-full transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        צור מבחן חדש
                    </button>
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="חפש מבחן לפי כותרת או שם קובץ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:flex-grow px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
                 <div className="flex items-center gap-2 bg-gray-200 dark:bg-zinc-800 p-1 rounded-full">
                    <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-zinc-700/50'}`}>
                        הכל
                    </button>
                    <button onClick={() => setFilter('draft')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'draft' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-zinc-700/50'}`}>
                        טיוטות
                    </button>
                    <button onClick={() => setFilter('published')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'published' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-zinc-700/50'}`}>
                        פורסמו
                    </button>
                </div>
            </div>

            {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredExams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onSelect={onSelectExam}
                            onDelete={onDelete}
                            onPublish={onPublish}
                            onEdit={onEdit}
                            onShowCodes={onShowCodes}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                       </svg>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">לא נמצאו מבחנים.</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {exams.length === 0 ? "עדיין לא יצרת מבחנים. לחץ על 'צור מבחן חדש' כדי להתחיל!" : "נסה מילת חיפוש או פילטר אחר."}
                    </p>
                </div>
            )}
        </main>
    );
};

export default Dashboard;
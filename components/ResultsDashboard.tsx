import React, { useState, useMemo } from 'react';
import type { Exam, Student, Submission } from '../types';
import ChartBarIcon from './icons/ChartBarIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';

interface ResultsDashboardProps {
  exams: Exam[];
  students: Student[];
  submissions: Submission[];
  onViewSubmission: (submission: Submission) => void;
  onBack: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ exams, students, submissions, onViewSubmission, onBack }) => {
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

    const publishedExams = useMemo(() => exams.filter(e => e.status === 'פורסם'), [exams]);

    const selectedExamSubmissions = useMemo(() => {
        if (!selectedExamId) return [];
        return submissions
            .filter(s => s.examId === selectedExamId)
            .map(s => {
                const student = students.find(st => st.id === s.studentId);
                return {
                    ...s,
                    studentName: student?.name || 'תלמיד לא ידוע',
                    studentClass: student?.class || '-',
                    percentage: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
                };
            })
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [selectedExamId, submissions, students]);

    const getScoreColor = (percentage: number) => {
        if (percentage >= 85) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
            <button onClick={onBack} className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold mb-6">
                <ArrowUturnLeftIcon className="w-5 h-5 transform scale-x-[-1]" />
                חזרה לדף הבית
            </button>
            <div className="flex items-center gap-3 mb-8">
                <ChartBarIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">תוצאות מבחנים</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">בחר מבחן לצפייה</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {publishedExams.map(exam => (
                                <button 
                                    key={exam.id} 
                                    onClick={() => setSelectedExamId(exam.id)}
                                    className={`w-full text-right p-3 rounded-lg transition-colors text-lg ${selectedExamId === exam.id ? 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                                >
                                    {exam.title}
                                </button>
                            ))}
                             {publishedExams.length === 0 && <p className="text-gray-500">אין מבחנים שפורסמו.</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                     <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {selectedExamId ? `תוצאות עבור: ${exams.find(e=>e.id === selectedExamId)?.title}` : 'בחר מבחן כדי לראות תוצאות'}
                            </h2>
                        </div>
                        {selectedExamId && (
                            selectedExamSubmissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead className="bg-gray-50 dark:bg-zinc-800">
                                            <tr>
                                                <th className="px-6 py-3 text-lg font-semibold text-gray-600 dark:text-gray-300">תלמיד/ה</th>
                                                <th className="px-6 py-3 text-lg font-semibold text-gray-600 dark:text-gray-300">ציון</th>
                                                <th className="px-6 py-3 text-lg font-semibold text-gray-600 dark:text-gray-300">תאריך הגשה</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                            {selectedExamSubmissions.map(sub => (
                                                <tr key={sub.studentId} onClick={() => onViewSubmission(sub)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{sub.studentName}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{sub.studentClass}</p>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`font-bold text-lg ${getScoreColor(sub.percentage)}`}>{sub.percentage}%</span>
                                                        <span className="text-gray-500 dark:text-gray-400"> ({sub.score}/{sub.totalQuestions})</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        {new Date(sub.submittedAt).toLocaleString('he-IL')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6">
                                    <p className="text-gray-500 dark:text-gray-400">עדיין אין הגשות למבחן זה.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ResultsDashboard;
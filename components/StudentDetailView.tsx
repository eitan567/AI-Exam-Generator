
import React, { useMemo } from 'react';
import type { Exam, Student, Submission } from '../types';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ClockIcon from './icons/ClockIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';
import UserFocusIcon from './icons/UserFocusIcon';

interface StudentDetailViewProps {
  student: Student;
  exams: Exam[];
  submissions: Submission[];
  onViewSubmission: (submission: Submission) => void;
  onBack: () => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, exams, submissions, onViewSubmission, onBack }) => {

    const { completedExamsData, pendingExams } = useMemo(() => {
        const studentSubmissions = submissions.filter(s => s.studentId === student.id);
        
        const completedExamsData = studentSubmissions
            .map(sub => {
                const exam = exams.find(e => e.id === sub.examId);
                if (!exam) return null;
                const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
                const percentage = totalPoints > 0 ? Math.round((sub.score / totalPoints) * 100) : 0;
                return { submission: sub, exam, percentage };
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b!.submission.submittedAt).getTime() - new Date(a!.submission.submittedAt).getTime());

        const assignedExamIds = new Set(exams
            .filter(e => e.status === 'פורסם' && e.accessCodes?.[student.id])
            .map(e => e.id)
        );
        
        const completedExamIds = new Set(studentSubmissions.map(s => s.examId));

        const pendingExams = Array.from(assignedExamIds)
            .filter(examId => !completedExamIds.has(examId))
            .map(examId => exams.find(e => e.id === examId))
            .filter(Boolean);

        return { completedExamsData, pendingExams };

    }, [student.id, exams, submissions]);

    const getScoreColor = (percentage: number) => {
        if (percentage >= 85) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
            <header className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold mb-4">
                    <ArrowUturnLeftIcon className="w-5 h-5 transform scale-x-[-1]" />
                    חזרה לניהול תלמידים
                </button>
                <div className="flex items-center gap-4">
                     <div className="flex-shrink-0 h-16 w-16">
                        {student.imageUrl ? (
                            <img className="h-16 w-16 rounded-full object-cover" src={student.imageUrl} alt={student.name} />
                        ) : (
                            <span className="h-16 w-16 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                <UserAvatarIcon className="h-10 w-10 text-gray-500" />
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{student.name}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">כיתה: {student.class} | ת.ז: {student.id}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Completed Exams */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                         <CheckCircleIcon className="w-8 h-8 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">מבחנים שהושלמו</h2>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                        {completedExamsData.length > 0 ? (
                            <div className="space-y-3">
                                {completedExamsData.map(({ submission, exam, percentage }) => (
                                    <button 
                                        key={submission.examId}
                                        onClick={() => onViewSubmission(submission)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-pink-50 dark:hover:bg-zinc-700/50 hover:shadow-md transition-all text-right"
                                    >
                                        <div>
                                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{exam!.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">הוגש ב: {new Date(submission.submittedAt).toLocaleDateString('he-IL')}</p>
                                        </div>
                                        <p className={`text-xl font-bold ${getScoreColor(percentage!)}`}>{percentage}%</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 px-6">
                                <p className="text-gray-500 dark:text-gray-400">התלמיד/ה עוד לא השלים/ה מבחנים.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Pending Exams */}
                <div>
                     <div className="flex items-center gap-3 mb-4">
                         <ClockIcon className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">מבחנים ממתינים</h2>
                    </div>
                     <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                        {pendingExams.length > 0 ? (
                            <div className="space-y-3">
                                {pendingExams.map(exam => (
                                    <div key={exam!.id} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-right">
                                        <div>
                                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{exam!.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">פורסם ב: {new Date(exam!.creationDate).toLocaleDateString('he-IL')}</p>
                                        </div>
                                         <span className="font-mono text-lg font-bold text-pink-600 dark:text-pink-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded">
                                            {exam!.accessCodes?.[student.id]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 px-6">
                                <p className="text-gray-500 dark:text-gray-400">אין מבחנים שממתינים לתלמיד/ה.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default StudentDetailView;

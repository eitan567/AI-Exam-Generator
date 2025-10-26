import React, { useState, useMemo } from 'react';
import type { Exam, Student, Submission } from '../types';
import UserAvatarIcon from './icons/UserAvatarIcon';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import ArrowLeftOnRectangleIcon from './icons/ArrowLeftOnRectangleIcon';

interface StudentPortalProps {
    student: Student;
    exams: Exam[];
    submissions: Submission[];
    onUpdateProfile: (student: Student) => void;
    onStartExam: (accessCode: string) => void;
    onViewSubmission: (submission: Submission) => void;
    onLogout: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ student, exams, submissions, onUpdateProfile, onStartExam, onViewSubmission, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'exams' | 'profile'>('exams');
    const [formState, setFormState] = useState<Student>(student);
    const [newPassword, setNewPassword] = useState('');
    const [examCodeInput, setExamCodeInput] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const { completedExamsData, pendingExams } = useMemo(() => {
        const studentSubmissions = submissions.filter(s => s.studentId === student.id);
        const completedExamsData = studentSubmissions.map(sub => {
            const exam = exams.find(e => e.id === sub.examId);
            if (!exam) return null;
            const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
            const percentage = totalPoints > 0 ? Math.round((sub.score / totalPoints) * 100) : 0;
            return { submission: sub, exam, percentage };
        }).filter(Boolean).sort((a, b) => new Date(b!.submission.submittedAt).getTime() - new Date(a!.submission.submittedAt).getTime());
        
        const assignedExamIds = new Set(exams.filter(e => e.status === 'פורסם' && e.accessCodes?.[student.id]).map(e => e.id));
        const completedExamIds = new Set(studentSubmissions.map(s => s.examId));
        const pendingExams = Array.from(assignedExamIds).filter(examId => !completedExamIds.has(examId)).map(examId => exams.find(e => e.id === examId)).filter(Boolean);

        return { completedExamsData, pendingExams };
    }, [student.id, exams, submissions]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: The type of formState.subjects is string[] but can be a string at runtime due to handleProfileChange.
        // We use a variable of type any to handle this ambiguity.
        const subjectsValue: any = formState.subjects;
        const subjectsArray = typeof subjectsValue === 'string'
            ? subjectsValue.split(',').map((s: string) => s.trim()).filter(Boolean)
            : subjectsValue;
        
        const updatedStudent: Student = {
            ...formState,
            subjects: subjectsArray,
            password: newPassword.trim() ? newPassword.trim() : formState.password,
        };
        onUpdateProfile(updatedStudent);
        setNewPassword('');
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
    };

    const handleStartExam = (e: React.FormEvent) => {
        e.preventDefault();
        if (examCodeInput.trim()) {
            onStartExam(examCodeInput.trim());
        }
    };
    
    const getScoreColor = (percentage: number) => {
        if (percentage >= 85) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900" dir="rtl">
            <header className="bg-white dark:bg-zinc-900 shadow-md p-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                            {student.imageUrl ? <img src={student.imageUrl} alt={student.name} className="h-12 w-12 rounded-full object-cover" /> : <UserAvatarIcon className="w-8 h-8 text-gray-500" />}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">שלום, {student.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">כיתה: {student.class}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 font-semibold rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">
                       <ArrowLeftOnRectangleIcon className="w-5 h-5 transform scale-x-[-1]"/>
                       התנתקות
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6 border-b border-gray-200 dark:border-zinc-700">
                    <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                        <button onClick={() => setActiveTab('exams')} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'exams' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><ClipboardDocCheckIcon className="w-6 h-6"/> המבחנים שלי</button>
                        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'profile' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><UserCircleIcon className="w-6 h-6"/> הפרופיל שלי</button>
                    </nav>
                </div>

                {activeTab === 'exams' && (
                    <div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 mb-8">
                            <form onSubmit={handleStartExam} className="flex flex-col sm:flex-row items-center gap-4">
                                <label htmlFor="examCode" className="text-lg font-semibold text-gray-700 dark:text-gray-200">יש לך קוד למבחן חדש?</label>
                                <input type="text" id="examCode" value={examCodeInput} onChange={(e) => setExamCodeInput(e.target.value)} className="flex-grow w-full sm:w-auto px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="הזן קוד מבחן"/>
                                <button type="submit" className="btn-cta w-full sm:w-auto px-6 py-3 text-black dark:text-white font-bold rounded-full text-lg">התחל מבחן</button>
                            </form>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">מבחנים שהושלמו</h2>
                                {completedExamsData.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {completedExamsData.map(({ submission, exam, percentage }) => (
                                            <button key={submission.examId} onClick={() => onViewSubmission(submission)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-800/50 rounded-lg hover:bg-pink-50 dark:hover:bg-zinc-700/50 shadow hover:shadow-lg transition-all text-right">
                                                <div>
                                                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{exam!.title}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">הוגש ב: {new Date(submission.submittedAt).toLocaleDateString('he-IL')}</p>
                                                </div>
                                                <p className={`text-xl font-bold ${getScoreColor(percentage!)}`}>{percentage}%</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">עדיין לא השלמת מבחנים.</p>}
                            </div>
                             <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">מבחנים ממתינים</h2>
                                {pendingExams.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pendingExams.map(exam => (
                                            <div key={exam!.id} className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-800/50 rounded-lg shadow text-right">
                                                <div>
                                                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{exam!.title}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">יש להזין את קוד המבחן כדי להתחיל</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">אין לך מבחנים שממתינים כרגע.</p>}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div><label htmlFor="id" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">תעודת זהות</label><input type="text" value={formState.id} readOnly className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-500 cursor-not-allowed" /></div>
                                <div><label htmlFor="name" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">שם מלא</label><input type="text" id="name" name="name" value={formState.name} onChange={handleProfileChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" /></div>
                                <div><label htmlFor="password" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">סיסמה חדשה</label><input type="password" id="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="השאר ריק כדי לא לשנות" /></div>
                                <div><label htmlFor="class" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">כיתה</label><input type="text" id="class" name="class" value={formState.class} onChange={handleProfileChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" /></div>
                                <div><label htmlFor="subjects" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">מקצועות</label><input type="text" id="subjects" name="subjects" value={Array.isArray(formState.subjects) ? formState.subjects.join(', ') : formState.subjects} onChange={handleProfileChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="היסטוריה, ספרות (מופרד בפסיק)" /></div>
                                <div><label htmlFor="imageUrl" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">קישור לתמונה</label><input type="url" id="imageUrl" name="imageUrl" value={formState.imageUrl} onChange={handleProfileChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="https://..." /></div>
                                <div className="pt-2 flex justify-end items-center gap-4">
                                    {updateSuccess && <span className="text-green-500 font-semibold transition-opacity">הפרטים עודכנו!</span>}
                                    <button type="submit" className="btn-cta px-6 py-3 text-black dark:text-white font-bold rounded-full text-lg">עדכן פרטים</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentPortal;
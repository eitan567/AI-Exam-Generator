
import React from 'react';
import type { Exam, Student, Submission, StudentAnswer, Question } from '../types';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ClockIcon from './icons/ClockIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import { QUESTION_TYPES } from '../constants';
import AiAvatarIcon from './icons/AiAvatarIcon';
import LightbulbIcon from './icons/LightbulbIcon';

interface SubmissionDetailViewProps {
  submission: Submission;
  exam: Exam;
  student: Student;
  onBack: () => void;
}

const formatDuration = (milliseconds: number) => {
    if (milliseconds < 0) milliseconds = 0;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const completionStatusInfo = {
    completed: { text: 'הוגש בזמן', icon: <CheckBadgeIcon className="w-5 h-5 text-green-500" />, color: 'text-green-500' },
    time_out: { text: 'הזמן אזל', icon: <ClockIcon className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-500' },
    quit: { text: 'יציאה יזומה', icon: <ExclamationCircleIcon className="w-5 h-5 text-red-500" />, color: 'text-red-500' },
};

const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
};

const isAnswerCorrect = (question: Question, studentAnswer: StudentAnswer): boolean => {
    if (!studentAnswer) return false;

    if (question.type === 'single-choice') {
        const correctAnswer = question.options?.find(opt => opt.isCorrect)?.text;
        return studentAnswer === correctAnswer;
    }
    if (question.type === 'multiple-choice') {
        const correctAnswers = question.options?.filter(opt => opt.isCorrect).map(opt => opt.text) || [];
        const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
        return arraysEqual(correctAnswers, studentAnswers);
    }
    return false; // Cannot determine correctness for open-ended questions here
};

const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({ submission, exam, student, onBack }) => {
    const timeTaken = new Date(submission.submittedAt).getTime() - new Date(submission.startTime).getTime();
    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPoints > 0 ? Math.round((submission.score / totalPoints) * 100) : 0;
    const status = completionStatusInfo[submission.completionStatus];
    
    return (
        <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold mb-4">
                        <ArrowUturnLeftIcon className="w-5 h-5 transform scale-x-[-1]" />
                        חזרה
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{exam.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">הגשה של: {student.name}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">ציון סופי</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{percentage}% ({submission.score}/{totalPoints})</p>
                    </div>
                     <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2"><StopwatchIcon className="w-5 h-5"/> זמן בחינה</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatDuration(timeTaken)}</p>
                    </div>
                     <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">סטטוס הגשה</h3>
                        <div className={`flex items-center gap-2 text-2xl font-bold ${status.color}`}>{status.icon} {status.text}</div>
                    </div>
                </div>

                <div className="space-y-6">
                    {exam.questions.map((q, index) => {
                        const studentAnswer = submission.answers[q.id];
                        const isCorrect = q.type !== 'open-ended' && isAnswerCorrect(q, studentAnswer);
                        
                        return (
                            <div key={q.id} className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">שאלה {index + 1} <span className="font-semibold text-gray-500 dark:text-gray-400">({q.points} נק')</span></p>
                                        <span className="text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/50 px-2 py-0.5 rounded-md">
                                            {QUESTION_TYPES[q.type]}
                                        </span>
                                    </div>
                                    {q.type !== 'open-ended' && (
                                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {isCorrect ? 'נכון' : 'לא נכון'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">{q.questionText}</p>
                                
                                <div className="space-y-3">
                                    {q.type === 'open-ended' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">תשובת התלמיד/ה:</h4>
                                                <p className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg whitespace-pre-wrap">{studentAnswer || '(לא נענה)'}</p>
                                            </div>
                                            {q.correctAnswer && (
                                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-r-4 border-yellow-400 dark:border-yellow-500">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <LightbulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400"/>
                                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">תשובה מופתית</h4>
                                                    </div>
                                                    <p className="text-yellow-800 dark:text-yellow-200">{q.correctAnswer}</p>
                                                </div>
                                            )}
                                             {submission.gradedAnswers?.[q.id] && (
                                                <div className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 dark:bg-zinc-700 flex items-center justify-center mt-1"><AiAvatarIcon className="w-5 h-5 text-white dark:text-pink-300" /></div>
                                                    <div>
                                                        <p className="font-bold text-pink-800 dark:text-pink-200">הערכת AI: {submission.gradedAnswers[q.id].score} / {q.points} נקודות</p>
                                                        <p className="text-pink-700 dark:text-pink-300">{submission.gradedAnswers[q.id].feedback}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        q.options?.map(opt => {
                                            const isStudentChoice = Array.isArray(studentAnswer) ? studentAnswer.includes(opt.text) : studentAnswer === opt.text;
                                            const isCorrectOption = opt.isCorrect;

                                            let colorClass = 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700';
                                            if (isCorrectOption) {
                                                colorClass = 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700';
                                            } else if (isStudentChoice && !isCorrectOption) {
                                                colorClass = 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700';
                                            }
                                            
                                            return (
                                                <div key={opt.text} className={`flex items-center p-3 rounded-lg border ${colorClass}`}>
                                                    <div className="flex-shrink-0 w-12 flex items-center justify-start gap-2">
                                                        {isStudentChoice && <UserCircleIcon className="w-6 h-6 text-blue-500" title="תשובת התלמיד"/>}
                                                    </div>
                                                    {isCorrectOption
                                                        ? <CheckCircleIcon className="w-6 h-6 text-green-500 ml-3 flex-shrink-0" title="תשובה נכונה" />
                                                        : <XCircleIcon className="w-6 h-6 text-gray-400 dark:text-zinc-500 ml-3 flex-shrink-0" />
                                                    }
                                                    <span className="text-gray-800 dark:text-gray-200">{opt.text}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetailView;

import React, { useState, useEffect, useMemo } from 'react';
import type { Exam, User, StudentAnswer } from '../types';
import ClockIcon from './icons/ClockIcon';
import ConfirmModal from './ConfirmModal';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';
import CheckIcon from './icons/CheckIcon';

interface ExamTakingProps {
    exam: Exam;
    user: User;
    onSubmitExam: (answers: Record<string, StudentAnswer>, startTime: string, completionStatus: 'completed' | 'time_out' | 'quit') => void;
    onQuitExam: () => void;
}

const ExamTaking: React.FC<ExamTakingProps> = ({ exam, user, onSubmitExam, onQuitExam }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
    const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
    const [startTime] = useState(() => new Date().toISOString());

    const currentQuestion = useMemo(() => exam.questions[currentQuestionIndex], [exam.questions, currentQuestionIndex]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    onSubmitExam(answers, startTime, 'time_out'); // Auto-submit when time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [answers, onSubmitExam, startTime]);

    const handleAnswerChange = (questionId: string, answer: StudentAnswer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleMultiChoiceChange = (questionId: string, optionText: string, checked: boolean) => {
        const currentAnswers = (answers[questionId] as string[] || []);
        const newAnswers = checked
            ? [...currentAnswers, optionText]
            : currentAnswers.filter(ans => ans !== optionText);
        handleAnswerChange(questionId, newAnswers);
    };

    const handleConfirmSubmit = () => {
        onSubmitExam(answers, startTime, 'completed');
        setIsSubmitModalOpen(false);
    };
    
    const handleConfirmQuit = () => {
        onSubmitExam(answers, startTime, 'quit');
        onQuitExam();
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex flex-col" dir="rtl">
            <header className="bg-white dark:bg-zinc-900 shadow-md sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{exam.title}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">נבחן: {user.name}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsQuitModalOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
                        >
                            <ArrowUturnLeftIcon className="w-5 h-5"/>
                            יציאה
                        </button>
                        <div className={`flex items-center gap-2 p-2 rounded-lg font-mono text-lg font-semibold 
                            ${timeRemaining < 300 ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50' : 'text-gray-700 dark:text-gray-200'}`}>
                            <ClockIcon className="w-6 h-6" />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="mb-6">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">שאלה {currentQuestionIndex + 1} מתוך {exam.questions.length}</p>
                        <p className="text-xl text-gray-900 dark:text-gray-100 mt-2">{currentQuestion.questionText}</p>
                        
                        {currentQuestion.type === 'multiple-choice' && (
                            <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/30 rounded-lg text-pink-800 dark:text-pink-200 font-semibold border border-pink-200 dark:border-pink-700/50">
                                יש לבחור {currentQuestion.options?.filter(o => o.isCorrect).length || 0} תשובות נכונות.
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {currentQuestion.type === 'single-choice' && currentQuestion.options?.map(opt => {
                            const isChecked = answers[currentQuestion.id] === opt.text;
                            return (
                                <label key={opt.text} className="flex items-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border-2 border-transparent has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50 dark:has-[:checked]:bg-pink-900/30 transition-all cursor-pointer group">
                                    <input type="radio" name={currentQuestion.id} value={opt.text}
                                        checked={isChecked}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        className="sr-only" />
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ml-4 ${isChecked ? 'border-pink-600 bg-pink-600' : 'border-gray-400 dark:border-gray-500 group-hover:border-pink-500'}`}>
                                        {isChecked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-lg text-gray-800 dark:text-gray-200">{opt.text}</span>
                                </label>
                            );
                        })}
                        {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map(opt => {
                           const isChecked = (answers[currentQuestion.id] as string[] || []).includes(opt.text);
                           return (
                               <label key={opt.text} className="flex items-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border-2 border-transparent has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50 dark:has-[:checked]:bg-pink-900/30 transition-all cursor-pointer group">
                                    <input type="checkbox" value={opt.text}
                                        checked={isChecked}
                                        onChange={(e) => handleMultiChoiceChange(currentQuestion.id, opt.text, e.target.checked)}
                                        className="sr-only" />
                                    <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all ml-4 ${isChecked ? 'border-pink-600 bg-pink-600' : 'border-gray-400 dark:border-gray-500 group-hover:border-pink-500'}`}>
                                        {isChecked && <CheckIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className="text-lg text-gray-800 dark:text-gray-200">{opt.text}</span>
                                </label>
                           );
                        })}
                        {currentQuestion.type === 'open-ended' && (
                            <textarea
                                value={answers[currentQuestion.id] as string || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                rows={8}
                                className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 text-lg"
                                placeholder="הקלד/י את תשובתך כאן..."
                            />
                        )}
                    </div>
                </div>
            </main>
             <footer className="bg-white dark:bg-zinc-900 shadow-inner sticky bottom-0 z-10 p-4 border-t border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 font-semibold rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        הקודם
                    </button>
                    {currentQuestionIndex === exam.questions.length - 1 ? (
                        <button onClick={() => setIsSubmitModalOpen(true)} className="px-8 py-3 font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-lg">
                            הגש מבחן
                        </button>
                    ) : (
                        <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-8 py-3 font-bold rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors text-lg">
                            הבא
                        </button>
                    )}
                </div>
            </footer>
            <ConfirmModal 
                isOpen={isSubmitModalOpen} 
                onClose={() => setIsSubmitModalOpen(false)} 
                onConfirm={handleConfirmSubmit} 
                title="הגשת מבחן" 
                message="האם אתה בטוח שברצונך להגיש את המבחן? לא תוכל לשנות את תשובותיך."
                confirmText="הגשה"
                confirmColor="green"
            />
            <ConfirmModal 
                isOpen={isQuitModalOpen} 
                onClose={() => setIsQuitModalOpen(false)} 
                onConfirm={handleConfirmQuit} 
                title="יציאה מהמבחן" 
                message="האם אתה בטוח שברצונך לצאת? התקדמותך לא תישמר."
                confirmText="כן, צא"
                confirmColor="red"
            />
        </div>
    );
};

export default ExamTaking;
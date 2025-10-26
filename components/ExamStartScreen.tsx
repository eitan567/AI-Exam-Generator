import React from 'react';
import type { Exam, User } from '../types';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import ClockIcon from './icons/ClockIcon';

interface ExamStartScreenProps {
    exam: Exam;
    user: User;
    onStart: () => void;
    onExit: () => void;
}

const ExamStartScreen: React.FC<ExamStartScreenProps> = ({ exam, user, onStart, onExit }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col justify-center items-center p-4" dir="rtl">
            <div className="w-full max-w-2xl text-center bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-zinc-800">
                <p className="text-lg text-gray-600 dark:text-gray-300">שלום, {user.name}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2 mb-4">את/ה עומד/ת להתחיל את המבחן:</h1>
                <h2 className="text-2xl font-semibold text-pink-600 dark:text-pink-400 mb-8">{exam.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-10">
                    <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">פרטי המבחן</h3>
                        <ul className="mt-2 space-y-2 text-gray-600 dark:text-gray-300">
                            <li className="flex items-center"><ClipboardDocCheckIcon className="w-5 h-5 ml-2 text-pink-500" /><span>מספר שאלות: {exam.questions.length}</span></li>
                            <li className="flex items-center"><ClockIcon className="w-5 h-5 ml-2 text-pink-500" /><span>משך המבחן: {exam.duration} דקות</span></li>
                        </ul>
                    </div>
                    <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
                         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">הנחיות</h3>
                         <ul className="mt-2 space-y-2 text-gray-600 dark:text-gray-300 list-disc list-inside">
                            <li>יש לענות על כל השאלות.</li>
                            <li>הטיימר יתחיל מיד בלחיצה על "התחל בחינה".</li>
                            <li>לא ניתן לחזור אחורה לאחר הגשת המבחן.</li>
                         </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
                     <button
                        onClick={onStart}
                        className="btn-cta w-full sm:w-auto px-10 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105"
                    >
                        התחל בחינה
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full sm:w-auto px-8 py-4 text-gray-700 dark:text-gray-200 font-semibold rounded-full bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                        חזרה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamStartScreen;

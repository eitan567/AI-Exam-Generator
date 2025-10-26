import React from 'react';
import type { Exam, Question } from '../types';
import ClockIcon from './icons/ClockIcon';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { QUESTION_TYPES } from '../constants';
import LightbulbIcon from './icons/LightbulbIcon';

interface ExamPreviewProps {
  exam: Exam;
}

const QuestionDisplay: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">שאלה {index + 1} <span className="font-semibold text-gray-500 dark:text-gray-400">({question.points} נק')</span></p>
          <span className="text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/50 px-2 py-0.5 rounded-md">
            {QUESTION_TYPES[question.type]}
          </span>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">{question.questionText}</p>
      
      {question.options && (
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <div key={i} className={`flex items-center p-3 rounded-lg border ${opt.isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'}`}>
              {opt.isCorrect 
                ? <CheckCircleIcon className="w-6 h-6 text-green-500 ml-3 flex-shrink-0" />
                : <XCircleIcon className="w-6 h-6 text-red-500 ml-3 flex-shrink-0" />
              }
              <span className="text-gray-800 dark:text-gray-200">{opt.text}</span>
            </div>
          ))}
        </div>
      )}

      {question.type === 'open-ended' && (
        <div className="mt-4 space-y-4">
            <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg text-gray-500 dark:text-gray-400">
                מקום לתשובת התלמיד/ה
            </div>
            {question.correctAnswer && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-r-4 border-yellow-400 dark:border-yellow-500">
                    <div className="flex items-center gap-2 mb-2">
                         <LightbulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400"/>
                         <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">תשובה לדוגמה</h4>
                    </div>
                    <p className="text-yellow-800 dark:text-yellow-200">{question.correctAnswer}</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

const ExamPreview: React.FC<ExamPreviewProps> = ({ exam }) => {
  return (
    <div className="pt-6 pb-6 px-4">
      <header className="mb-8 pb-4 border-b-2 border-pink-200 dark:border-pink-800">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">{exam.title}</h2>
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-gray-600 dark:text-gray-300 pdf-flex-header">
          <div className="flex items-center pdf-flex-header">
            <ClipboardDocCheckIcon className="w-5 h-5 ml-1.5" />
            <span>{exam.questions.length} שאלות</span>
          </div>
          <span>&bull;</span>
           <div className="flex items-center pdf-flex-header">
            <span className="font-semibold">100 נקודות</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center pdf-flex-header pdf-clock-container">
            <ClockIcon className="w-5 h-5 ml-1.5" />
            <span>{exam.duration} דקות</span>
          </div>
           {exam.sourceFileNames && exam.sourceFileNames.length > 0 && (
               <>
                <span>&bull;</span>
                <div className="flex items-center pdf-flex-header">
                    <span>מבוסס על: {exam.sourceFileNames.join(', ')}</span>
                </div>
               </>
           )}
        </div>
      </header>

      <div className="space-y-8">
        {exam.questions.map((q, i) => (
          <QuestionDisplay key={q.id} question={q} index={i} />
        ))}
      </div>
    </div>
  );
};

export default ExamPreview;
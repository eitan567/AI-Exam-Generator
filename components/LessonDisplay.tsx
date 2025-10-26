
import React from 'react';
import type { Exam, Question, AnswerOption } from '../types';
import ClockIcon from './icons/ClockIcon';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { QUESTION_TYPES } from '../constants';

interface ExamPreviewProps {
  exam: Exam;
}

const QuestionDisplay: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">שאלה {index + 1}</p>
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
        <div className="mt-4">
            <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg text-gray-500 dark:text-gray-400">
                מקום לתשובת התלמיד/ה
            </div>
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
          <div className="flex items-center pdf-flex-header pdf-clock-container">
            <ClockIcon className="w-5 h-5 ml-1.5" />
            <span>{exam.duration} דקות</span>
          </div>
           {/* FIX: Changed property 'sourceFileName' to 'sourceFileNames' and checked array length. */}
           {exam.sourceFileNames && exam.sourceFileNames.length > 0 && (
               <>
                <span>&bull;</span>
                <div className="flex items-center pdf-flex-header">
                    {/* FIX: Changed property 'sourceFileName' to 'sourceFileNames' and joined the array. */}
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
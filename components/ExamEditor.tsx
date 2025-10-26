import React, { useState, useMemo } from 'react';
import type { Exam, Question, QuestionType, AnswerOption } from '../types';
import { QUESTION_TYPES } from '../constants';
import { getAiSuggestions, regenerateExamContent, SuggestionType } from '../services/geminiService';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import CheckIcon from './icons/CheckIcon';
import SuggestionModal from './SuggestionModal';
import ConfirmModal from './ConfirmModal';

interface ExamEditorProps {
    exam: Exam;
    onSave: (updatedExam: Exam) => void;
    onCancel: () => void;
    onOpenChat: () => void;
}

const ExamEditor: React.FC<ExamEditorProps> = ({ exam, onSave, onCancel, onOpenChat }) => {
    const [editableExam, setEditableExam] = useState<Exam>(() => structuredClone(exam));
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestionModalTitle, setSuggestionModalTitle] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [fullSuggestions, setFullSuggestions] = useState<any[]>([]);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [suggestionContext, setSuggestionContext] = useState<{ type: SuggestionType; qIndex?: number; oIndex?: number; questionType?: QuestionType } | null>(null);
    const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const totalPoints = useMemo(() => {
        return editableExam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    }, [editableExam.questions]);

    const handleExamDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableExam(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (qIndex: number, field: 'questionText' | 'type' | 'points' | 'correctAnswer', value: string | number) => {
        const updatedQuestions = [...editableExam.questions];
        const questionToUpdate: Question = { ...updatedQuestions[qIndex], [field]: value };

        if (field === 'type') {
            if (value === 'open-ended') {
                delete questionToUpdate.options;
                if (!questionToUpdate.correctAnswer) questionToUpdate.correctAnswer = '';
            } else {
                delete questionToUpdate.correctAnswer;
                if (!questionToUpdate.options) {
                    questionToUpdate.options = [{ text: '', isCorrect: true }, { text: '', isCorrect: false }];
                }
            }
        }
        updatedQuestions[qIndex] = questionToUpdate;
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
        const updatedQuestions = [...editableExam.questions];
        updatedQuestions[qIndex].options![oIndex].text = text;
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleCorrectnessChange = (qIndex: number, oIndex: number) => {
        const updatedQuestions = [...editableExam.questions];
        const question = updatedQuestions[qIndex];
        if (question.type === 'single-choice') {
            question.options!.forEach((opt, i) => opt.isCorrect = i === oIndex);
        } else {
            question.options![oIndex].isCorrect = !question.options![oIndex].isCorrect;
        }
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
    };
    
    const addOption = (qIndex: number) => {
        const updatedQuestions = [...editableExam.questions];
        updatedQuestions[qIndex].options!.push({ text: '', isCorrect: false });
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updatedQuestions = [...editableExam.questions];
        updatedQuestions[qIndex].options!.splice(oIndex, 1);
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const addQuestion = (type: QuestionType, initialText: string = '') => {
        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            type: type,
            questionText: initialText,
            points: 5, // Default points
        };
        if (type !== 'open-ended') {
            newQuestion.options = [
                { text: initialText ? '' : 'תשובה א', isCorrect: false },
                { text: initialText ? '' : 'תשובה ב', isCorrect: false }
            ];
            if(initialText) newQuestion.options = [];
        } else {
            newQuestion.correctAnswer = '';
        }
        setEditableExam(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    };

    const removeQuestion = (qIndex: number) => {
        const updatedQuestions = [...editableExam.questions];
        updatedQuestions.splice(qIndex, 1);
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
    };
    
    const handleOpenSuggestions = async (type: SuggestionType, context: { qIndex?: number, oIndex?: number, questionType?: QuestionType }) => {
        setIsSuggestionModalOpen(true);
        setIsSuggestionLoading(true);
        setSuggestions([]);
        setFullSuggestions([]);
        setSuggestionContext({ type, ...context });

        let title = 'הצעות AI';
        if (type === 'regenerate_question') title = 'הצעות לניסוח חלופי לשאלה';
        else if (type === 'regenerate_answer') title = 'הצעות לניסוח חלופי לתשובה';
        else if (type === 'suggest_incorrect_answer') title = 'הצעות לתשובה אפשרית שגויה';
        else if (type === 'suggest_correct_answer') title = 'הצעות לתשובה אפשרית נכונה';
        else if (type === 'suggest_new_question') title = 'הצעות לשאלה חדשה';
        setSuggestionModalTitle(title);

        try {
            const result = await getAiSuggestions(editableExam, type, context);
            if (type === 'suggest_new_question' && context.questionType !== 'open-ended') {
                setFullSuggestions(result);
                setSuggestions(result.map((q: any) => q.questionText));
            } else {
                setSuggestions(result);
            }
        } catch (error) {
            console.error(error);
            setSuggestions([error instanceof Error ? error.message : 'אירעה שגיאה בקבלת הצעות.']);
        } finally {
            setIsSuggestionLoading(false);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        if (!suggestionContext) return;
        const { type, qIndex, oIndex, questionType } = suggestionContext;

        if (type === 'suggest_new_question' && questionType) {
            if (questionType !== 'open-ended') {
                const fullSuggestion = fullSuggestions.find(s => s.questionText === suggestion);
                if (fullSuggestion) {
                    const newQuestion: Question = {
                        id: `q-${Date.now()}`,
                        type: questionType,
                        questionText: fullSuggestion.questionText,
                        options: fullSuggestion.options,
                        points: 5,
                    };
                    setEditableExam(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
                }
            } else {
                addQuestion(questionType, suggestion);
            }
            setIsSuggestionModalOpen(false);
            return;
        }

        const updatedQuestions = structuredClone(editableExam.questions);
        if (type === 'regenerate_question' && qIndex !== undefined) {
            updatedQuestions[qIndex].questionText = suggestion;
        } else if (type === 'regenerate_answer' && qIndex !== undefined && oIndex !== undefined) {
            updatedQuestions[qIndex].options![oIndex].text = suggestion;
        } else if (type === 'suggest_incorrect_answer' && qIndex !== undefined) {
            updatedQuestions[qIndex].options!.push({ text: suggestion, isCorrect: false });
        } else if (type === 'suggest_correct_answer' && qIndex !== undefined) {
             updatedQuestions[qIndex].options!.push({ text: suggestion, isCorrect: true });
        }
        
        setEditableExam(prev => ({ ...prev, questions: updatedQuestions }));
        setIsSuggestionModalOpen(false);
    };

    const handleRegenerateExam = async () => {
        setIsRegenerateConfirmOpen(false);
        setIsRegenerating(true);
        try {
            const regeneratedContent = await regenerateExamContent(editableExam);
            setEditableExam(prev => ({
                ...prev,
                title: regeneratedContent.title,
                questions: regeneratedContent.questions,
            }));
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'שגיאה ביצירה מחדש של המבחן.');
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
                {isRegenerating && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-2xl">
                        <svg className="animate-spin h-10 w-10 text-pink-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">מייצר מחדש את תוכן המבחן...</p>
                        <p className="text-gray-600 dark:text-gray-400">הפעולה עשויה לקחת מספר רגעים.</p>
                    </div>
                )}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold">עריכת מבחן</h1>
                        <button onClick={() => setIsRegenerateConfirmOpen(true)} className="p-2 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 rounded-full hover:bg-pink-100 dark:hover:bg-zinc-700" title="מלא מחדש את כל השאלות והתשובות בעזרת AI">
                            <SparklesIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <button onClick={onOpenChat} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">
                        <SparklesIcon className="w-5 h-5 text-pink-500"/>
                        עזרה מ-AI
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label htmlFor="title" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">כותרת המבחן</label>
                        <input type="text" id="title" name="title" value={editableExam.title} onChange={handleExamDetailChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg"/>
                    </div>
                     <div>
                        <label htmlFor="duration" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">זמן (דקות)</label>
                        <input type="number" id="duration" name="duration" value={editableExam.duration} onChange={handleExamDetailChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg"/>
                    </div>
                </div>

                <div className="space-y-6">
                    {editableExam.questions.map((q, qIndex) => (
                        <div key={q.id} className="p-6 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold">שאלה {qIndex + 1}</h3>
                                    <input 
                                        type="number" 
                                        value={q.points} 
                                        onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value, 10) || 0)}
                                        className="w-20 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-center font-semibold"
                                        aria-label="ניקוד שאלה"
                                    />
                                </div>
                                <button onClick={() => removeQuestion(qIndex)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-zinc-700 rounded-full" title="מחק שאלה"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="relative w-full">
                                <textarea value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)} rows={3} className="w-full p-2 pl-10 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 mb-4" placeholder="כתוב את השאלה כאן..."/>
                                <button onClick={() => handleOpenSuggestions('regenerate_question', { qIndex })} className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-pink-500 bg-white/50 dark:bg-zinc-800/50 rounded-full hover:bg-pink-100 dark:hover:bg-zinc-700" title="קבל ניסוח חלופי מ-AI">
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {q.type === 'open-ended' ? (
                                <div>
                                    <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">תשובה מופתית (לצורך בדיקה)</label>
                                    <textarea value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} rows={4} className="w-full p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600" placeholder="כתוב תשובה מלאה שתשמש כבסיס לבדיקה..."/>
                                </div>
                            ) : q.options && (
                                <div className="space-y-3">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3">
                                            {q.type === 'single-choice' ? (
                                                <label className="flex items-center cursor-pointer group" title="סמן כתשובה נכונה"><input type="radio" name={`correct-${q.id}`} checked={opt.isCorrect} onChange={() => handleCorrectnessChange(qIndex, oIndex)} className="sr-only" /><div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${opt.isCorrect ? 'border-pink-600 bg-pink-600' : 'border-gray-400 dark:border-gray-500 group-hover:border-pink-500'}`}>{opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full"></div>}</div></label>
                                            ) : (
                                                <label className="flex items-center cursor-pointer group" title="סמן כתשובה נכונה"><input type="checkbox" checked={opt.isCorrect} onChange={() => handleCorrectnessChange(qIndex, oIndex)} className="sr-only" /><div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all ${opt.isCorrect ? 'border-pink-600 bg-pink-600' : 'border-gray-400 dark:border-gray-500 group-hover:border-pink-500'}`}>{opt.isCorrect && <CheckIcon className="w-4 h-4 text-white" />}</div></label>
                                            )}
                                            <div className="relative flex-grow"><input type="text" value={opt.text} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full p-2 pl-9 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600" placeholder={`תשובה ${oIndex + 1}`} /><button onClick={() => handleOpenSuggestions('regenerate_answer', { qIndex, oIndex })} className="absolute top-1/2 -translate-y-1/2 left-1 p-1 text-gray-400 hover:text-pink-500 rounded-full hover:bg-pink-100 dark:hover:bg-zinc-700" title="קבל ניסוח חלופי מ-AI"><SparklesIcon className="w-4 h-4" /></button></div>
                                            <button onClick={() => removeOption(qIndex, oIndex)} className="p-1 text-gray-500 hover:text-red-600" title="מחק תשובה"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-4 pt-2">
                                        <button onClick={() => addOption(qIndex)} className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:underline"><PlusIcon className="w-4 h-4"/> הוסף תשובה</button>
                                        <button onClick={() => handleOpenSuggestions('suggest_incorrect_answer', { qIndex })} className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:underline"><SparklesIcon className="w-4 h-4"/> הצע תשובה שגויה</button>
                                         <button onClick={() => handleOpenSuggestions('suggest_correct_answer', { qIndex })} className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:underline"><SparklesIcon className="w-4 h-4"/> הצע תשובה נכונה</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-700 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="font-semibold">הוסף שאלה:</p>
                        <button onClick={() => addQuestion('single-choice')} className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300">אמריקאית (יחיד)</button>
                        <button onClick={() => addQuestion('multiple-choice')} className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300">אמריקאית (מרובה)</button>
                        <button onClick={() => addQuestion('open-ended')} className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300">פתוחה</button>
                    </div>
                     <div className="flex flex-wrap items-center gap-4">
                        <p className="font-semibold">הצע שאלה עם AI:</p>
                        <button onClick={() => handleOpenSuggestions('suggest_new_question', { questionType: 'single-choice' })} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300"><SparklesIcon className="w-4 h-4 text-pink-500"/> אמריקאית (יחיד)</button>
                        <button onClick={() => handleOpenSuggestions('suggest_new_question', { questionType: 'multiple-choice' })} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300"><SparklesIcon className="w-4 h-4 text-pink-500"/> אמריקאית (מרובה)</button>
                        <button onClick={() => handleOpenSuggestions('suggest_new_question', { questionType: 'open-ended' })} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300"><SparklesIcon className="w-4 h-4 text-pink-500"/> פתוחה</button>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-between items-center">
                     <div className={`text-lg font-bold p-2 rounded-md ${totalPoints === 100 ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50'}`}>
                        סה"כ ניקוד: {totalPoints} / 100
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="px-6 py-3 font-semibold rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600" disabled={isRegenerating}>ביטול</button>
                        <button onClick={() => onSave(editableExam)} className="px-8 py-3 font-bold rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50" disabled={isRegenerating || totalPoints !== 100}>
                            {isRegenerating ? 'מעדכן...' : 'שמור שינויים'}
                        </button>
                    </div>
                </div>
            </div>
            <SuggestionModal
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                onSelect={handleSelectSuggestion}
                title={suggestionModalTitle}
                suggestions={suggestions}
                isLoading={isSuggestionLoading}
            />
            <ConfirmModal
                isOpen={isRegenerateConfirmOpen}
                onClose={() => setIsRegenerateConfirmOpen(false)}
                onConfirm={handleRegenerateExam}
                title="יצירה מחדש של המבחן"
                message="פעולה זו תחליף את כל השאלות והתשובות הנוכחיות בתוכן חדש שנוצר על ידי AI, תוך שמירה על מבנה המבחן. האם להמשיך?"
                confirmText="כן, צור מחדש"
                confirmColor="blue"
            />
        </main>
    );
};

export default ExamEditor;
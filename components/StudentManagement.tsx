import React, { useState } from 'react';
import type { Student } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilIcon from './icons/PencilIcon';
import EditStudentModal from './EditStudentModal';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onViewStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onBack: () => void;
}

const initialFormState = {
    name: '',
    id: '',
    password: '',
    class: '',
    subjects: '',
    imageUrl: '',
};

const StudentManagement: React.FC<StudentManagementProps> = ({ students, onAddStudent, onDeleteStudent, onViewStudent, onUpdateStudent, onBack }) => {
    const [formState, setFormState] = useState(initialFormState);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if(!formState.name.trim() || !formState.id.trim() || !formState.class.trim() || !formState.password.trim()) {
            setError('יש למלא את כל השדות: שם, תעודת זהות, סיסמה וכיתה.');
            return;
        }
        if (!/^\d{8,9}$/.test(formState.id.trim())) {
            setError('תעודת הזהות חייבת להכיל 8 או 9 ספרות.');
            return;
        }
        if (students.some(s => s.id === formState.id.trim())) {
            setError('תעודת זהות זו כבר קיימת במערכת.');
            return;
        }
        
        const subjectsArray = formState.subjects.split(',').map(s => s.trim()).filter(Boolean);

        onAddStudent({ 
            id: formState.id.trim(), 
            name: formState.name.trim(),
            password: formState.password.trim(),
            class: formState.class.trim(),
            imageUrl: formState.imageUrl.trim(),
            subjects: subjectsArray,
        });
        setFormState(initialFormState);
        setActiveTab('list'); // Switch back to the list after adding
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
            <button onClick={onBack} className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold mb-6">
                <ArrowUturnLeftIcon className="w-5 h-5 transform scale-x-[-1]" />
                חזרה לדף הבית
            </button>
            <div className="flex items-center gap-3 mb-4">
                <UserGroupIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">ניהול תלמידים</h1>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200 dark:border-zinc-700">
                <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                            activeTab === 'add'
                                ? 'border-pink-500 text-pink-600 dark:text-pink-400 dark:border-pink-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                        }`}
                        aria-current={activeTab === 'add' ? 'page' : undefined}
                    >
                        <UserPlusIcon className="w-6 h-6" />
                        תלמיד חדש
                    </button>
                     <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                            activeTab === 'list'
                                ? 'border-pink-500 text-pink-600 dark:text-pink-400 dark:border-pink-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                        }`}
                        aria-current={activeTab === 'list' ? 'page' : undefined}
                    >
                        <UserGroupIcon className="w-6 h-6" />
                        תלמידים קיימים ({students.length})
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'list' && (
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                        {students.length > 0 ? (
                           <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                                {students.map(student => (
                                    <button 
                                        key={student.id} 
                                        onClick={() => onViewStudent(student)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-pink-50 dark:hover:bg-zinc-700/50 hover:shadow-md transition-all text-right"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 h-12 w-12">
                                                {student.imageUrl ? (
                                                    <img className="h-12 w-12 rounded-full object-cover" src={student.imageUrl} alt={student.name} />
                                                ) : (
                                                    <span className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                                        <UserAvatarIcon className="h-8 w-8 text-gray-500" />
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{student.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">כיתה: {student.class} &bull; ת.ז: {student.id}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingStudent(student); }} 
                                                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-zinc-700"
                                                title="ערוך פרטי תלמיד"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteStudent(student.id); }} 
                                                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-zinc-700"
                                                title="מחק תלמיד"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-6">
                                <p className="text-gray-500 dark:text-gray-400">עדיין לא נוספו תלמידים. התחל על ידי הוספת תלמיד חדש.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'add' && (
                     <div className="max-w-2xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">שם מלא</label>
                                    <input type="text" id="name" name="name" value={formState.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="ישראל ישראלי" required />
                                </div>
                                <div>
                                    <label htmlFor="id" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">תעודת זהות</label>
                                    <input type="text" id="id" name="id" value={formState.id} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="9 ספרות" required />
                                </div>
                                 <div>
                                    <label htmlFor="password" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">סיסמה</label>
                                    <input type="password" id="password" name="password" value={formState.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="סיסמה לכניסת התלמיד" required />
                                </div>
                                <div>
                                    <label htmlFor="class" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">כיתה</label>
                                    <input type="text" id="class" name="class" value={formState.class} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="למשל: י' 1" required />
                                </div>
                                <div>
                                    <label htmlFor="subjects" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">מקצועות</label>
                                    <input type="text" id="subjects" name="subjects" value={formState.subjects} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="היסטוריה, ספרות (מופרד בפסיק)" />
                                </div>
                                <div>
                                    <label htmlFor="imageUrl" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">קישור לתמונה (אופציונלי)</label>
                                    <div className="flex items-center gap-4">
                                        <input type="url" id="imageUrl" name="imageUrl" value={formState.imageUrl} onChange={handleChange} className="flex-grow w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="https://..." />
                                        <div className="flex-shrink-0 h-12 w-12">
                                            {formState.imageUrl ? (
                                                <img className="h-12 w-12 rounded-full object-cover" src={formState.imageUrl} alt="תצוגה מקדימה" onError={(e) => e.currentTarget.style.display='none'} onLoad={(e) => e.currentTarget.style.display='block'} />
                                            ) : (
                                                <span className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                                    <UserAvatarIcon className="h-8 w-8 text-gray-500" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {error && <p className="text-red-500">{error}</p>}
                                <button type="submit" className="btn-cta w-full flex items-center justify-center gap-2 px-4 py-3 text-black dark:text-white font-bold rounded-full text-lg">
                                    <PlusIcon className="w-6 h-6" />
                                    הוסף תלמיד
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <EditStudentModal
                student={editingStudent}
                onClose={() => setEditingStudent(null)}
                onUpdate={(updatedStudent) => {
                    onUpdateStudent(updatedStudent);
                    setEditingStudent(null);
                }}
            />
        </main>
    );
};

export default StudentManagement;
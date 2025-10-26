import React, { useState, useEffect } from 'react';
import type { Student } from '../types';
import XIcon from './icons/XIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';
import PencilIcon from './icons/PencilIcon';

interface EditStudentModalProps {
    student: Student | null;
    onUpdate: (student: Student) => void;
    onClose: () => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onUpdate, onClose }) => {
    const [formState, setFormState] = useState<Student | null>(student);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setFormState(student);
        setNewPassword('');
        setError('');
    }, [student]);

    if (!student) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formState || !formState.name.trim() || !formState.class.trim()) {
            setError('יש למלא שם וכיתה.');
            return;
        }

        // FIX: The type of formState.subjects is string[] but can be a string at runtime due to handleChange.
        // We use a variable of type any to handle this ambiguity.
        const subjectsValue: any = formState.subjects;
        const subjectsArray = typeof subjectsValue === 'string'
            ? subjectsValue.split(',').map((s: string) => s.trim()).filter(Boolean)
            : subjectsValue;
            
        const updatedStudent: Student = {
            ...formState,
            name: formState.name.trim(),
            class: formState.class.trim(),
            imageUrl: formState.imageUrl?.trim() || '',
            subjects: subjectsArray,
            password: newPassword.trim() ? newPassword.trim() : formState.password,
        };

        onUpdate(updatedStudent);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="div-cta rounded-2xl w-full max-w-lg relative" 
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-6">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10">
                        <XIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <PencilIcon className="w-7 h-7 text-pink-600 dark:text-pink-400"/>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">עריכת פרטי תלמיד</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="edit-id" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">תעודת זהות (לא ניתן לעריכה)</label>
                            <input type="text" id="edit-id" name="id" value={formState?.id || ''} readOnly className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label htmlFor="edit-name" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">שם מלא</label>
                            <input type="text" id="edit-name" name="name" value={formState?.name || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                        <div>
                            <label htmlFor="edit-password" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">סיסמה חדשה (אופציונלי)</label>
                            <input type="password" id="edit-password" name="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="השאר ריק כדי לשמור על הסיסמה הנוכחית" />
                        </div>
                         <div>
                            <label htmlFor="edit-class" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">כיתה</label>
                            <input type="text" id="edit-class" name="class" value={formState?.class || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                         <div>
                            <label htmlFor="edit-subjects" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">מקצועות</label>
                            <input type="text" id="edit-subjects" name="subjects" value={Array.isArray(formState?.subjects) ? formState.subjects.join(', ') : formState?.subjects || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="מופרד בפסיק" />
                        </div>
                        <div>
                            <label htmlFor="edit-imageUrl" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">קישור לתמונה</label>
                            <div className="flex items-center gap-4">
                                <input type="url" id="edit-imageUrl" name="imageUrl" value={formState?.imageUrl || ''} onChange={handleChange} className="flex-grow w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="https://..." />
                                <div className="flex-shrink-0 h-12 w-12">
                                    {formState?.imageUrl ? (
                                        <img className="h-12 w-12 rounded-full object-cover" src={formState.imageUrl} alt="תצוגה מקדימה" onError={(e) => e.currentTarget.style.display='none'} onLoad={(e) => e.currentTarget.style.display='block'} />
                                    ) : (
                                        <span className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                            <UserAvatarIcon className="h-8 w-8 text-gray-500" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-center">{error}</p>}

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-6 py-2.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-300 dark:border-zinc-600 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700"
                                onClick={onClose}
                            >
                                ביטול
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-pink-600 text-white font-semibold rounded-lg shadow-sm hover:bg-pink-700"
                            >
                                שמור שינויים
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditStudentModal;
import React from 'react';
import XIcon from './icons/XIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'green' | 'blue';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'אישור',
    cancelText = 'ביטול',
    confirmColor = 'red'
}) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    };

    const iconColorClasses = {
        red: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="div-cta rounded-2xl w-full max-w-md relative" 
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-6">
                    <div className="flex items-start">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ml-4 ${iconColorClasses[confirmColor]}`}>
                            <AlertTriangleIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-grow text-right">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-md text-gray-600 dark:text-gray-300">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-300 dark:border-zinc-600 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`px-6 py-2.5 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses[confirmColor]}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
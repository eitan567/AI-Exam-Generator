import React from 'react';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface AlertModalProps {
    info: { title: string; message: string } | null;
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ info, onClose }) => {
    if (!info) return null;

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
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 ml-4">
                            <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-grow text-right">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                                {info.title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-md text-gray-600 dark:text-gray-300">
                                    {info.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            הבנתי
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
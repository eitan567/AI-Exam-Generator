import React, { useState } from 'react';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import KeyIcon from './icons/KeyIcon';
import ArrowLeftOnRectangleIcon from './icons/ArrowLeftOnRectangleIcon';
import GmailIcon from './icons/GmailIcon';
import UserIcon from './icons/UserIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import IdCardIcon from './icons/IdCardIcon';

interface LoginScreenProps {
  onTeacherLogin: (username: string, password: string) => boolean;
  onGmailLogin: () => void;
  onStudentLogin: (studentId: string, password: string, accessCode?: string) => 'success' | 'portal' | string;
  onBackToHome: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onTeacherLogin, onGmailLogin, onStudentLogin, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  // Student form state
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  // Teacher form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onStudentLogin(studentId.trim(), studentPassword.trim(), accessCode.trim());
    if (typeof result === 'string' && result !== 'success' && result !== 'portal') {
      setError(result);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onTeacherLogin(username, password);
    if (!success) {
      setError("שם משתמש או סיסמה שגויים.");
    }
  };

  const TabButton: React.FC<{ tabName: 'teacher' | 'student', label: string, icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => { setActiveTab(tabName); setError(''); }}
      className={`w-1/2 flex items-center justify-center gap-3 p-4 font-bold text-lg border-b-4 transition-all duration-300
        ${activeTab === tabName
          ? 'border-pink-500 text-pink-600 dark:text-pink-400'
          : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col justify-center items-center p-4" dir="rtl">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3">
                 <ClipboardDocCheckIcon className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                 <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">כניסה למערכת</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">הדרך החכמה ליצירת וביצוע מבחנים.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
          <div className="flex">
            <TabButton tabName="teacher" label="מורה" icon={<UserGroupIcon className="w-6 h-6"/>} />
            <TabButton tabName="student" label="תלמיד" icon={<IdCardIcon className="w-6 h-6"/>} />
          </div>

          <div className="p-8">
            {activeTab === 'teacher' ? (
              <div className="space-y-6">
                 <form onSubmit={handleTeacherSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="username" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">שם משתמש (אימייל)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input type="email" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" required placeholder="teacher@example.com" />
                      </div>
                    </div>
                     <div>
                      <label htmlFor="password"  className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">סיסמה</label>
                      <div className="relative">
                         <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <LockClosedIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500" required placeholder="password123" />
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <button type="submit" className="btn-cta w-full flex items-center justify-center gap-3 px-6 py-3 text-black dark:text-white text-lg font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105">
                        <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                        כניסה
                    </button>
                 </form>
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white dark:bg-zinc-900 px-2 text-sm text-gray-500 dark:text-gray-400">או</span>
                    </div>
                 </div>
                 <button onClick={onGmailLogin} className="w-full flex items-center justify-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 font-bold rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                    <GmailIcon className="w-6 h-6" />
                    התחברות עם Google
                 </button>
              </div>
            ) : (
              <form onSubmit={handleStudentSubmit} className="space-y-6">
                <div>
                  <label htmlFor="studentId" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">תעודת זהות</label>
                  <input
                    type="text" id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                 <div>
                  <label htmlFor="studentPassword"  className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">סיסמה</label>
                  <input
                    type="password" id="studentPassword" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="accessCode" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">קוד מבחן (אופציונלי)</label>
                  <input
                    type="text" id="accessCode" value={accessCode} onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="הזן קוד כדי להיכנס ישר למבחן"
                  />
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <button type="submit" className="btn-cta w-full flex items-center justify-center gap-3 px-6 py-4 text-black dark:text-white text-lg font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105">
                     <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                     כניסה
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-6 text-center">
            <button
                onClick={onBackToHome}
                className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 font-semibold transition-colors duration-200 text-lg"
            >
                &rarr; חזרה לדף הבית
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
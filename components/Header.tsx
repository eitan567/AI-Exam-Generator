import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import type { User } from '../types';

interface HeaderProps {
    onNavigateHome: () => void;
    onNavigateToDashboard: () => void;
    onNavigateToStudents: () => void;
    onNavigateToResults: () => void;
    onNavigateToSettings: () => void;
    onLogout: () => void;
    user: User | null;
}

const Header: React.FC<HeaderProps> = ({ 
    onNavigateHome, 
    onNavigateToDashboard, 
    onNavigateToStudents,
    onNavigateToResults,
    onNavigateToSettings, 
    onLogout, 
    user 
}) => {
    const { setSettings } = useContext(SettingsContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDarkMode(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(root.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    const handleThemeToggle = () => {
        setSettings({ theme: isDarkMode ? 'light' : 'dark' });
    };

    const handleNavigate = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };
    
    const handleLogoClick = () => {
        if (user) {
            handleNavigate(onNavigateToDashboard);
        } else {
            handleNavigate(onNavigateHome);
        }
    };

    const navLinks = (
        <>
            <button onClick={() => handleNavigate(onNavigateToDashboard)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">דף הבית</button>
            <button onClick={() => handleNavigate(onNavigateToStudents)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">ניהול תלמידים</button>
            <button onClick={() => handleNavigate(onNavigateToResults)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">תוצאות מבחנים</button>
            <button onClick={() => handleNavigate(onNavigateToSettings)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">הגדרות</button>
            {user && (
                 <button onClick={() => handleNavigate(onLogout)} className="md:hidden hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">התנתקות</button>
            )}
        </>
    );

    const ThemeToggleButton = () => (
        <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={isDarkMode ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
        >
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );

    return (
        <header className="border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 md:grid md:grid-cols-3">
                    <div className="flex items-center cursor-pointer md:justify-self-start" onClick={handleLogoClick}>
                        <ClipboardDocCheckIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-3" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">יוצר המבחנים AI</h1>
                    </div>

                    <nav className="hidden md:flex md:justify-self-center space-x-6 space-x-reverse items-center text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {navLinks}
                    </nav>

                    <div className="md:justify-self-end">
                        <div className="hidden md:flex items-center gap-4">
                            <ThemeToggleButton />
                            {user && (
                                <button
                                    onClick={onLogout}
                                    className="btn-cta rounded-full transition-transform transform hover:scale-105"
                                >
                                    <span className="block bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 px-4 py-1.5 rounded-full font-semibold text-sm">
                                        התנתקות
                                    </span>
                                </button>
                            )}
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                            <ThemeToggleButton />
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 z-50 relative">
                                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <nav className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200 dark:border-zinc-800 text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {navLinks}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;

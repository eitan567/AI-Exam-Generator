import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import ClipboardDocCheckIcon from './icons/BookOpenIcon';
import CpuChipIcon from './icons/CpuChipIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import AdjustmentsHorizontalIcon from './icons/AdjustmentsHorizontalIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import FeatureModal from './FeatureModal';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import ShareIcon from './icons/ShareIcon';
import LinkedinIcon from './icons/LinkedinIcon';
import XSocialIcon from './icons/XSocialIcon';
import FacebookIcon from './icons/FacebookIcon';

interface LandingPageProps {
    onEnter: () => void;
    onNavigateHome: () => void;
}

const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    modalContent: {
        detailedDescription: string;
        example: React.ReactNode;
    };
}

const featuresData: Feature[] = [
    {
        icon: <CpuChipIcon className="w-8 h-8" />,
        title: "יצירת מבחן מקובץ",
        description: "העלו חומר לימוד בפורמט PDF והמערכת תיצור עבורכם מבחן שלם באופן אוטומטי.",
        modalContent: {
            detailedDescription: "חסכו שעות של עבודה ידנית. פשוט העלו את חומר הלימוד שלכם, והבינה המלאכותית תסרוק, תבין ותנסח שאלות רלוונטיות ומאתגרות המבוססות ישירות על התוכן.",
            example: (
                <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">// פשוט העלו את קובץ הסיכום שלכם</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">summary_history_ch5.pdf</p>
                    </div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-4">// ותקבלו מבחן מוכן</p>
                </div>
            )
        }
    },
    {
        icon: <QuestionMarkCircleIcon className="w-8 h-8" />,
        title: "מגוון סוגי שאלות",
        description: "קבלו שאלות אמריקאיות (חד-ברירה ורב-ברירה) ושאלות פתוחות המותאמות לחומר.",
        modalContent: {
            detailedDescription: "המערכת לא יוצרת רק סוג אחד של שאלות. היא יודעת לגוון וליצור שאלות רבות-ברירה עם תשובה נכונה אחת, שאלות עם מספר תשובות נכונות, ושאלות פתוחות הדורשות הבנה וחשיבה ביקורתית.",
            example: (
                <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2 space-y-2">
                    <p><span className="font-semibold text-pink-600 dark:text-pink-400">שאלה אמריקאית:</span> מהי בירת צרפת?</p>
                    <p><span className="font-semibold text-pink-600 dark:text-pink-400">שאלה פתוחה:</span> הסבר שני גורמים עיקריים לפרוץ המהפכה הצרפתית.</p>
                </div>
            )
        }
    },
    {
        icon: <AdjustmentsHorizontalIcon className="w-8 h-8" />,
        title: "התאמה אישית מלאה",
        description: "קבעו את מספר השאלות מכל סוג, את משך המבחן, ועירכו כל שאלה ותשובה בקלות.",
        modalContent: {
            detailedDescription: "אתם בשליטה מלאה. לפני יצירת המבחן, אתם קובעים בדיוק כמה שאלות מכל סוג אתם רוצים. לאחר שהמבחן נוצר, תוכלו לעבור עליו, לערוך ניסוחים, להחליף תשובות או למחוק שאלות.",
            example: (
                <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">// הגדרות המבחן שלכם:</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2 space-y-2">
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">שאלות אמריקאיות:</span> 10</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">שאלות פתוחות:</span> 3</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">משך המבחן (דקות):</span> 90</p>
                    </div>
                </div>
            )
        }
    },
    {
        icon: <DocumentArrowDownIcon className="w-8 h-8" />,
        title: "ייצוא והפצה בקליק",
        description: "הפיצו לתלמידים קישור למבחן מקוון או ייצאו את המבחן לקובץ PDF להדפסה.",
        modalContent: {
            detailedDescription: "ברגע שהמבחן מוכן, יש לכם גמישות מלאה. תוכלו ליצור קישור ייחודי ולשלוח אותו לתלמידים לביצוע המבחן אונליין במערכת, או פשוט לייצא את המבחן כקובץ PDF מעוצב ומוכן להדפסה וחלוקה בכיתה.",
            example: (
                 <div className="flex justify-around items-center">
                    <button className="btn-cta px-4 py-2 text-black dark:text-white">העתק קישור</button>
                    <button className="btn-cta px-4 py-2 text-black dark:text-white">הורד כ-PDF</button>
                 </div>
            )
        }
    }
];

const faqData = [
    {
        question: "אילו סוגי קבצים אני יכול/ה להעלות?",
        answer: "המערכת תומכת כרגע בקבצי PDF בלבד. ניתן בקלות לשמור מסמכי Word כקובץ PDF ולהעלות אותם. אנו ממליצים להשתמש בקבצים עם טקסט ברור ומובנה לקבלת התוצאות הטובות ביותר."
    },
    {
        question: "האם השאלות מבוססות רק על החומר שהעליתי?",
        answer: "בהחלט. הבינה המלאכותית מסתמכת אך ורק על המידע הקיים במסמך שהעליתם. היא לא 'ממציאה' מידע חיצוני, מה שמבטיח שהמבחן יהיה רלוונטי לחומר הנלמד."
    },
    {
        question: "האם אני יכול/ה לערוך את המבחן לאחר שהוא נוצר?",
        answer: "כן! לאחר שה-AI יוצר את טיוטת המבחן, יש לכם שליטה מלאה. אתם יכולים לערוך את נוסח השאלות, לשנות את התשובות, להוסיף או למחוק שאלות כדי להתאים את המבחן בדיוק לצרכים שלכם."
    },
    {
        question: "איך עובד המבחן המקוון עבור התלמידים?",
        answer: "לאחר פרסום המבחן, המערכת מנפיקה קוד גישה ייחודי לכל תלמיד. התלמיד נכנס למערכת עם תעודת הזהות שלו והקוד שקיבל, ועונה על השאלות בממשק ידידותי עם טיימר. התשובות נשמרות ונשלחות אליכם אוטומטית בסיום."
    }
];

const FeatureCard: React.FC<{ feature: Feature; onClick: () => void }> = ({ feature, onClick }) => (
    <button
        onClick={onClick}
        className="div-cta rounded-xl transform hover:-translate-y-2 transition-transform duration-300 h-full text-right w-full"
    >
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl shadow-lg text-center h-full flex flex-col items-center">
            <div className="flex justify-center items-center mb-4">
                <div className="bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 p-4 rounded-full">{feature.icon}</div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
        </div>
    </button>
);

const FaqItem: React.FC<{ item: { question: string, answer: string }, isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => (
    <div className="border-b border-gray-200 dark:border-zinc-700">
        <button onClick={onClick} className="w-full flex justify-between items-center text-right py-5 px-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.question}</span>
            <svg className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="pb-5 px-2 text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                {item.answer}
            </div>
        </div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onNavigateHome }) => {
    const { settings, setSettings } = useContext(SettingsContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    const handleScrollTo = (id: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };
    
    const handleFaqToggle = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const navLinks = (
        <>
            <button onClick={() => handleScrollTo('features')} className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">תכונות</button>
            <button onClick={() => handleScrollTo('how-it-works')} className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">איך זה עובד</button>
            <button onClick={() => handleScrollTo('faq')} className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">שאלות נפוצות</button>
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
        <div className="bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200" dir="rtl">
            <header className="bg-white/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center cursor-pointer" onClick={onNavigateHome}>
                        <ClipboardDocCheckIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-3" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">מחולל המבחנים AI</h1>
                    </div>
                    <nav className="hidden md:flex space-x-8 space-x-reverse items-center">
                        {navLinks}
                    </nav>
                    <div className="flex items-center gap-4">
                        <ThemeToggleButton />
                        <div className="hidden md:block">
                            <button
                                onClick={onEnter}
                                className="btn-cta rounded-full transition-transform transform hover:scale-105"
                            >
                                <span className="block bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 px-4 py-1.5 rounded-full font-semibold text-sm">
                                    התחברות / כניסה
                                </span>
                            </button>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 z-50 relative">
                                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                {isMenuOpen && (
                     <div className="md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
                        <nav className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200 dark:border-zinc-800">
                            {navLinks}
                            <div className="pt-2 w-full px-6">
                                <button
                                    onClick={onEnter}
                                    className="btn-cta w-full rounded-full"
                                >
                                    <span className="block w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 px-4 py-1.5 rounded-full font-semibold text-sm">
                                        התחברות / כניסה
                                    </span>
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                <section className="py-20 md:py-32 text-center bg-white dark:bg-zinc-900">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight">
                            מבחנים חכמים יותר, <span className="gradient-text">בפחות מאמץ</span>
                        </h2>
                        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            הפסיקו לבזבז שעות על ניסוח שאלות. העלו את חומר הלימוד שלכם, והבינה המלאכותית שלנו תבנה עבורכם מבחן מקיף ומדויק תוך דקות.
                        </p>
                        <button
                            onClick={onEnter}
                            className="btn-cta mt-10 px-10 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105"
                        >
                            התחילו ליצור בחינם
                        </button>
                    </div>
                </section>

                <section id="features" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">הדרך החכמה להעריך ידע</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">כלים עוצמתיים שהופכים את יצירת המבחנים למשימה פשוטה.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuresData.map((feature, index) => (
                                <FeatureCard 
                                    key={index} 
                                    feature={feature} 
                                    onClick={() => setSelectedFeature(feature)} 
                                />
                            ))}
                        </div>
                    </div>
                </section>
                
                <section id="how-it-works" className="py-20 bg-white dark:bg-zinc-950">
                    <div className="container mx-auto px-6">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">שלושה צעדים פשוטים למבחן מושלם</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">ממסמך למבחן בכמה קליקים.</p>
                        </div>
                        <div className="relative">
                           <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gray-200 dark:bg-zinc-700 -translate-y-1/2"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                                <div className="text-center">
                                    <div className="flex justify-center items-center mb-4">
                                        <div className="bg-white dark:bg-zinc-950 p-2 rounded-full relative z-10">
                                            <div className="w-20 h-20 flex items-center justify-center bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 rounded-full text-2xl font-bold">1</div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-2"><ArrowUpTrayIcon className="w-6 h-6"/> העלאת חומר</h3>
                                    <p className="text-gray-600 dark:text-gray-300">גררו או בחרו קובץ PDF עם חומר הלימוד הרלוונטי.</p>
                                </div>
                                <div className="text-center">
                                     <div className="flex justify-center items-center mb-4">
                                        <div className="bg-white dark:bg-zinc-950 p-2 rounded-full relative z-10">
                                            <div className="w-20 h-20 flex items-center justify-center bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 rounded-full text-2xl font-bold">2</div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-2"><Cog6ToothIcon className="w-6 h-6"/> התאמה אישית</h3>
                                    <p className="text-gray-600 dark:text-gray-300">הגדירו את מספר השאלות מכל סוג ואת משך המבחן הרצוי.</p>
                                </div>
                                <div className="text-center">
                                     <div className="flex justify-center items-center mb-4">
                                        <div className="bg-white dark:bg-zinc-950 p-2 rounded-full relative z-10">
                                            <div className="w-20 h-20 flex items-center justify-center bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 rounded-full text-2xl font-bold">3</div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-2"><ShareIcon className="w-6 h-6"/> הפצה ושימוש</h3>
                                    <p className="text-gray-600 dark:text-gray-300">קבלו מבחן מוכן, יצאו ל-PDF או שתפו עם התלמידים אונליין.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                 <section id="testimonials" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">אל תאמינו רק לנו</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">מה מורים כמוכם אומרים על מחולל המבחנים AI.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="div-cta rounded-xl"><div className="bg-white dark:bg-zinc-950 p-8 rounded-xl shadow-lg h-full">
                                <p className="text-gray-600 dark:text-gray-300 mb-6">"הכלי הזה שינה לי את החיים. חסכתי שעות של עבודה סיזיפית, והשאלות שה-AI יצר היו ברמה גבוהה ומדויקת. מומלץ בחום!"</p>
                                <div className="font-bold text-gray-800 dark:text-gray-100">דנה כהן</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">מורה להיסטוריה, תיכון "העתיד"</div>
                            </div></div>
                            <div className="div-cta rounded-xl"><div className="bg-white dark:bg-zinc-950 p-8 rounded-xl shadow-lg h-full">
                                <p className="text-gray-600 dark:text-gray-300 mb-6">"בהתחלה הייתי סקפטי, אבל איכות המבחנים שהמערכת יצרה הפתיעה אותי לטובה. היכולת להתאים אישית כל פרט היא פשוט נהדרת."</p>
                                <div className="font-bold text-gray-800 dark:text-gray-100">אביתר לוי</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">רכז שכבה, חט"ב "נחשונים"</div>
                            </div></div>
                             <div className="div-cta rounded-xl"><div className="bg-white dark:bg-zinc-950 p-8 rounded-xl shadow-lg h-full">
                                <p className="text-gray-600 dark:text-gray-300 mb-6">"אני משתמשת גם באפשרות המקוונת וגם בייצוא ל-PDF. הגמישות הזו מקלה עליי מאוד את העבודה מול כיתות שונות. כלי חובה לכל מורה."</p>
                                <div className="font-bold text-gray-800 dark:text-gray-100">יעל שדה</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">מחנכת כיתה ו', יסודי "רעות"</div>
                            </div></div>
                        </div>
                    </div>
                </section>
                
                <section id="faq" className="py-20 bg-white dark:bg-zinc-950">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">שאלות נפוצות</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">יש לכם שאלות? אנחנו כאן עם התשובות.</p>
                        </div>
                        <div>
                            {faqData.map((item, index) => (
                                <FaqItem
                                    key={index}
                                    item={item}
                                    isOpen={openFaq === index}
                                    onClick={() => handleFaqToggle(index)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 text-center">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight">
                            מוכנים לחסוך זמן יקר?
                        </h2>
                        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                           הצטרפו למאות מורים שכבר משתמשים בכוח של AI כדי ליצור מבחנים טובים יותר, מהר יותר.
                        </p>
                        <button
                            onClick={onEnter}
                            className="btn-cta mt-10 px-10 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105"
                        >
                            כניסה ורישום למערכת
                        </button>
                    </div>
                </section>

            </main>

            <footer className="bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 text-right">
                        {/* Right side - Logo & Description */}
                        <div className="md:w-2/5">
                            <div className="flex items-center mb-4 cursor-pointer" onClick={onNavigateHome}>
                                <ClipboardDocCheckIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-3" />
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">מחולל המבחנים AI</h1>
                            </div>
                            <p className="max-w-sm">הכלי החכם למורים שרוצים ליצור מבחנים איכותיים בפחות זמן ומאמץ. מופעל על ידי בינה מלאכותית מתקדמת.</p>
                        </div>
            
                        {/* Left side - Links */}
                        <div className="flex-grow flex flex-col md:flex-row md:justify-end gap-8 md:gap-16">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">ניווט</h3>
                                <ul className="space-y-2">
                                    <li><button onClick={() => handleScrollTo('features')} className="hover:text-pink-500 transition-colors">תכונות</button></li>
                                    <li><button onClick={() => handleScrollTo('how-it-works')} className="hover:text-pink-500 transition-colors">איך זה עובד</button></li>
                                    <li><button onClick={() => handleScrollTo('faq')} className="hover:text-pink-500 transition-colors">שאלות נפוצות</button></li>
                                </ul>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">כלים</h3>
                                <ul className="space-y-2">
                                    <li><button onClick={onEnter} className="hover:text-pink-500 transition-colors">כניסה למערכת</button></li>
                                    <li><button onClick={onEnter} className="hover:text-pink-500 transition-colors">הרשמה</button></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">עקבו אחרינו</h3>
                                <div className="flex space-x-4 space-x-reverse">
                                    <a href="#" className="text-gray-400 hover:text-pink-500" aria-label="LinkedIn">
                                        <LinkedinIcon className="h-6 w-6" />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-pink-500" aria-label="X">
                                        <XSocialIcon className="h-6 w-6" />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-pink-500" aria-label="Facebook">
                                        <FacebookIcon className="h-6 w-6" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-200 dark:border-zinc-700 pt-8 text-center">
                         <p>&copy; {new Date().getFullYear()} מחולל המבחנים AI. כל הזכויות שמורות.</p>
                    </div>
                </div>
            </footer>

            <FeatureModal
                isOpen={!!selectedFeature}
                onClose={() => setSelectedFeature(null)}
                feature={selectedFeature}
            />
        </div>
    );
};

export default LandingPage;
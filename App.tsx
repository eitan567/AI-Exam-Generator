import React, { useState, useEffect, useContext, useRef } from 'react';
import type { ExamFormData, Exam, User, Student, Submission, StudentAnswer } from './types';
import { generateExamFromDocument, gradeOpenEndedAnswer } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ExamForm from './components/ExamForm';
import ExamPreview from './components/ExamPreview';
import ExamGenerationLoader from './components/ExamGenerationLoader';
import Settings from './components/Settings';
import ConfirmModal from './components/ConfirmModal';
import { SettingsContext } from './contexts/SettingsContext';
import Header from './components/Header';
import SupportChat from './components/SupportChat';
import ChatBubbleIcon from './components/icons/ChatBubbleIcon';
import LoginScreen from './components/LoginScreen';
import StudentManagement from './components/StudentManagement';
import PublishModal from './components/PublishModal';
import ExamTaking from './components/ExamTaking';
import ExamResults from './components/ExamResults';
import ExamChat from './components/ExamChat';
import LandingPage from './components/LandingPage';
import ExamStartScreen from './components/ExamStartScreen';
import ExamEditor from './components/ExamEditor';
import ResultsDashboard from './components/ResultsDashboard';
import AlertModal from './components/AlertModal';
import PencilIcon from './components/icons/PencilIcon';
import SubmissionDetailView from './components/SubmissionDetailView';
import GradingLoader from './components/GradingLoader';
import StudentDetailView from './components/StudentDetailView';
import ArrowUturnLeftIcon from './components/icons/ArrowUturnLeftIcon';
import StudentPortal from './components/StudentPortal';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

type AppView = 'landing' | 'login' | 'dashboard' | 'form' | 'preview' | 'loading' | 'settings' | 'results' | 'students' | 'examTaking' | 'examStart' | 'examEditor' | 'resultsDashboard' | 'submissionDetail' | 'grading' | 'studentDetail' | 'studentPortal';

const App: React.FC = () => {
    const { settings } = useContext(SettingsContext);
    const [user, setUser] = useState<User | null>(null);
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);
    const [view, setView] = useState<AppView>('landing');
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [currentExam, setCurrentExam] = useState<Exam | null>(null);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<string | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isExamChatOpen, setIsExamChatOpen] = useState(false);
    const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

    const examPreviewRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            if (settings.theme === 'dark' || (settings.theme === 'system' && mediaQuery.matches)) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };
        applyTheme();
        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, [settings.theme]);
    
    useEffect(() => {
        if (view !== 'examEditor') {
            setIsExamChatOpen(false);
        }
    }, [view]);

    useEffect(() => {
        try {
            const savedExams = localStorage.getItem('examHistory');
            if (savedExams) setExams(JSON.parse(savedExams));

            const savedStudents = localStorage.getItem('studentList');
            if(savedStudents) setStudents(JSON.parse(savedStudents));

            const savedSubmissions = localStorage.getItem('submissions');
            if(savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }, []);

    const saveData = (key: 'examHistory' | 'studentList' | 'submissions', data: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Failed to save ${key} to localStorage`, e);
        }
    };

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        if (loggedInUser.role === 'student') {
            const studentData = students.find(s => s.id === loggedInUser.id);
            if (studentData) setActiveStudent(studentData);
        }
        setView(loggedInUser.role === 'teacher' ? 'dashboard' : 'studentPortal');
    };

    const handleTeacherLogin = (username: string, password: string): boolean => {
        // Mock authentication
        if (username.toLowerCase() === 'teacher@example.com' && password === 'password123') {
            setUser({ id: 'teacher', name: 'Teacher', role: 'teacher' });
            setActiveStudent(null);
            setView('dashboard');
            return true;
        }
        return false;
    };
    
    const handleGmailLogin = () => {
        setUser({ id: 'teacher_gmail', name: 'Teacher (Gmail)', role: 'teacher' });
        setActiveStudent(null);
        setView('dashboard');
    };
    
    const handleStudentLogin = (studentId: string, password: string, accessCode?: string): 'success' | 'portal' | string => {
        const student = students.find(s => s.id === studentId);
        if (!student) return "תעודת זהות לא קיימת במערכת.";
        if (student.password !== password) return "סיסמה שגויה.";

        const studentUser = { id: student.id, name: student.name, role: 'student' as const };
        setUser(studentUser);
        setActiveStudent(student);

        if (accessCode) {
            const exam = exams.find(e => e.status === 'פורסם' && e.accessCodes?.[studentId] === accessCode);
            if (exam) {
                setCurrentExam(exam);
                setView('examStart');
                return 'success';
            } else {
                setView('studentPortal');
                setAlertInfo({ title: "קוד מבחן שגוי", message: "הקוד שהזנת אינו תקין. נכנסת לאזור האישי שלך, תוכל לנסות להזין את הקוד שוב כאן." });
                return 'portal';
            }
        }
        
        setView('studentPortal');
        return 'portal';
    };

    const handleLogout = () => {
        setUser(null);
        setActiveStudent(null);
        setCurrentExam(null);
        setView('landing');
    };

    const handleNavigate = (targetView: AppView) => setView(targetView);
    const handleNavigateHome = () => user ? (user.role === 'teacher' ? setView('dashboard') : setView('studentPortal')) : setView('landing');
    const handleCreateNew = () => {
        setCurrentExam(null);
        setEditingExam(null);
        setError(null);
        setView('form');
    };
    const handleSelectExam = (exam: Exam) => {
        setCurrentExam(exam);
        setError(null);
        setView('preview');
    };
    
    const handleAddStudent = (student: Student) => {
        const newStudents = [...students, student];
        setStudents(newStudents);
        saveData('studentList', newStudents);
    };

    const handleUpdateStudent = (studentToUpdate: Student) => {
        const newStudents = students.map(s => s.id === studentToUpdate.id ? studentToUpdate : s);
        setStudents(newStudents);
        saveData('studentList', newStudents);
        if (user?.role === 'student' && user.id === studentToUpdate.id) {
            setActiveStudent(studentToUpdate);
        }
    };

    const handleDeleteStudent = (studentId: string) => {
        const newStudents = students.filter(s => s.id !== studentId);
        setStudents(newStudents);
        saveData('studentList', newStudents);
    };

    const handleDeleteExam = (examId: string) => {
        setExamToDelete(examId);
        setIsConfirmModalOpen(true);
    };
    const handleConfirmDelete = () => {
        if (!examToDelete) return;
        const newExams = exams.filter(l => l.id !== examToDelete);
        setExams(newExams);
        saveData('examHistory', newExams);
        setIsConfirmModalOpen(false);
        setExamToDelete(null);
        if(currentExam?.id === examToDelete) {
          setView('dashboard');
          setCurrentExam(null);
        }
    };
    
    const handleStartEdit = (exam: Exam) => {
        setEditingExam(exam);
        setView('examEditor');
    };

    const handleUpdateExam = (updatedExam: Exam) => {
        const newExams = exams.map(e => e.id === updatedExam.id ? updatedExam : e);
        setExams(newExams);
        saveData('examHistory', newExams);
        setCurrentExam(updatedExam);
        setView('preview');
    };

    const handlePublishExam = (examId: string) => {
        const examToPublish = exams.find(e => e.id === examId);
        if (!examToPublish) {
            setAlertInfo({ title: "שגיאה", message: "המבחן לא נמצא." });
            return;
        }
        if (students.length === 0) {
            setAlertInfo({ title: "לא ניתן לפרסם", message: "יש להוסיף לפחות תלמיד אחד למערכת לפני פרסום מבחן." });
            return;
        }
        
        const accessCodes: Record<string, string> = {};
        students.forEach(student => {
            accessCodes[student.id] = Math.floor(100000 + Math.random() * 900000).toString();
        });

        const updatedExams = exams.map(e => e.id === examId ? { ...e, status: 'פורסם' as const, accessCodes } : e);
        setExams(updatedExams);
        saveData('examHistory', updatedExams);
        setCurrentExam(updatedExams.find(e => e.id === examId) || null);
        setIsPublishModalOpen(true);
    };

    const handleShowCodes = (exam: Exam) => {
        setCurrentExam(exam);
        setIsPublishModalOpen(true);
    };

    const handleStartTestDrive = (exam: Exam) => {
        setCurrentExam(exam);
        const testUser = { id: '000000000', name: 'מורה (בדיקה)', role: 'student' as const };
        setUser(testUser);
        setView('examStart');
    };
    
    const handleQuitExam = () => {
        if (user?.id === '000000000') {
            setUser({ id: 'teacher', name: 'Teacher', role: 'teacher' });
            setView('preview');
        } else if (user?.role === 'student') {
            setView('studentPortal');
        } else {
            handleLogout();
        }
    };

    const handleSubmitExam = async (answers: Record<string, StudentAnswer>, startTime: string, completionStatus: 'completed' | 'time_out' | 'quit') => {
        if (!currentExam || !user) return;
        
        setView('grading');

        let score = 0;
        const gradedAnswers: NonNullable<Submission['gradedAnswers']> = {};
        
        const openEndedQuestions = currentExam.questions.filter(q => q.type === 'open-ended');
        const closedQuestions = currentExam.questions.filter(q => q.type !== 'open-ended');
        
        let totalPoints = 0;
        
        closedQuestions.forEach(q => {
            totalPoints += q.points;
            const studentAnswer = answers[q.id];
            if (!studentAnswer) return;

            if (q.type === 'single-choice') {
                const correctAnswer = q.options?.find(opt => opt.isCorrect)?.text;
                if(studentAnswer === correctAnswer) {
                    score += q.points;
                }
            } else if (q.type === 'multiple-choice' && q.options) {
                const correctOptions = q.options.filter(opt => opt.isCorrect);
                const numCorrect = correctOptions.length;
                
                if (numCorrect > 0) {
                    const correctAnswersText = correctOptions.map(opt => opt.text);
                    const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [];
                    
                    // Penalty for selecting too many options
                    if (studentAnswers.length > numCorrect) {
                        // Score for this question is 0.
                    } else {
                        const correctlySelectedCount = studentAnswers.filter(ans => correctAnswersText.includes(ans)).length;
                        const questionScore = (correctlySelectedCount / numCorrect) * q.points;
                        score += questionScore;
                    }
                }
            }
        });

        for (const q of openEndedQuestions) {
            totalPoints += q.points;
            const studentAnswer = answers[q.id] as string;
            const result = await gradeOpenEndedAnswer(q, studentAnswer);
            score += result.score;
            gradedAnswers[q.id] = result;
        }
        
        const newSubmission: Submission = {
            examId: currentExam.id,
            studentId: user.id,
            answers,
            score: Math.round(score),
            totalQuestions: totalPoints,
            submittedAt: new Date().toISOString(),
            startTime,
            completionStatus,
            gradedAnswers,
        };
        
        if (user.id !== '000000000') {
            const newSubmissions = [...submissions, newSubmission];
            setSubmissions(newSubmissions);
            saveData('submissions', newSubmissions);
        }
        
        if (completionStatus === 'completed' || completionStatus === 'time_out') {
            setSubmission(newSubmission);
            setView('results');
        } else {
            if (user?.id === '000000000') {
                setUser({ id: 'teacher', name: 'Teacher', role: 'teacher' });
                setView('preview');
            } else { 
                setView('studentPortal');
            }
        }
    };

    const handleFinishViewingResults = () => {
        if (user?.id === '000000000') {
            setUser({ id: 'teacher', name: 'Teacher', role: 'teacher' });
            setView('preview');
        } else if (user?.role === 'student') {
            setView('studentPortal');
        } else {
            handleLogout();
        }
        setSubmission(null);
    };

    const handleViewSubmission = (submissionToView: Submission) => {
        setSelectedSubmission(submissionToView);
        setView('submissionDetail');
    };
    
    const handleStudentViewSubmission = (submissionToView: Submission) => {
        const exam = exams.find(e => e.id === submissionToView.examId);
        if (exam) {
            setSubmission(submissionToView);
            setCurrentExam(exam);
            setView('results');
        }
    };

    const handleViewStudent = (studentToView: Student) => {
        setSelectedStudent(studentToView);
        setView('studentDetail');
    };

    const handleExportToPdf = async () => {
        const element = examPreviewRef.current;
        if (!element || !currentExam) return;
        setIsExportingPdf(true);
        document.body.classList.add('pdf-export-active');
        try {
            const canvas = await window.html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / pdfWidth;
            const imgHeight = canvas.height / ratio;
            let heightLeft = imgHeight, position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`${currentExam.title.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')}.pdf`);
        } catch (err) {
            console.error("Error exporting to PDF", err);
            setError("שגיאה בייצוא ל-PDF.");
        } finally {
            document.body.classList.remove('pdf-export-active');
            setIsExportingPdf(false);
        }
    };

    const handleSubmit = async (formData: ExamFormData) => {
        setIsLoading(true);
        setError(null);
        setView('loading');
        try {
            const newExamContent = await generateExamFromDocument(formData, settings.aiModel);
            let newExam: Exam;
            if (formData.id) { 
                newExam = {
                    ...newExamContent,
                    id: formData.id,
                    duration: parseInt(formData.duration, 10),
                    creationDate: exams.find(e => e.id === formData.id)?.creationDate || new Date().toISOString(),
                    status: 'טיוטה',
                };
                const newExams = exams.map(e => e.id === formData.id ? newExam : e);
                setExams(newExams);
                saveData('examHistory', newExams);
            } else { 
                 newExam = {
                    ...newExamContent,
                    id: `exam-${Date.now()}`,
                    duration: parseInt(formData.duration, 10),
                    status: 'טיוטה',
                    creationDate: new Date().toISOString(),
                };
                const newExams = [newExam, ...exams];
                setExams(newExams);
                saveData('examHistory', newExams);
            }
            setCurrentExam(newExam);
            setView('preview');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`שגיאה ביצירת המבחן: ${errorMessage}`);
            setView(editingExam ? 'form' : 'dashboard');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderSupportChat = () => {
        if (view === 'login') return null;
        return (
            <>
                {!isSupportChatOpen && (
                    <button onClick={() => setIsSupportChatOpen(true)} className="fixed bottom-8 right-8 z-40 p-2 text-white rounded-full shadow-lg transition-transform transform hover:scale-110 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" title="פתח צ'אט תמיכה">
                        <ChatBubbleIcon className="w-8 h-8" />
                    </button>
                )}
                <SupportChat isOpen={isSupportChatOpen} onClose={() => setIsSupportChatOpen(false)} />
            </>
        );
    };

    const renderContent = () => {
        if (!user) {
            if (view === 'landing') {
                return <LandingPage onEnter={() => setView('login')} onNavigateHome={() => setView('landing')} />;
            }
            return <LoginScreen onTeacherLogin={handleTeacherLogin} onGmailLogin={handleGmailLogin} onStudentLogin={handleStudentLogin} onBackToHome={() => setView('landing')} />;
        }

        if (user.role === 'student' && activeStudent) {
            switch(view) {
                case 'studentPortal':
                    return <StudentPortal 
                                student={activeStudent}
                                exams={exams}
                                submissions={submissions}
                                onUpdateProfile={handleUpdateStudent}
                                onStartExam={(accessCode) => handleStudentLogin(activeStudent.id, activeStudent.password, accessCode)}
                                onViewSubmission={handleStudentViewSubmission}
                                onLogout={handleLogout}
                           />;
                case 'examStart':
                    if (currentExam && user) return <ExamStartScreen exam={currentExam} user={user} onStart={() => setView('examTaking')} onExit={handleQuitExam} />;
                    else { setView('studentPortal'); return null; }
                case 'examTaking':
                    if(currentExam && user) return <ExamTaking exam={currentExam} user={user} onSubmitExam={handleSubmitExam} onQuitExam={handleQuitExam} />;
                    else { setView('studentPortal'); return null; }
                case 'results':
                    if(submission && currentExam) return <ExamResults submission={submission} exam={currentExam} onFinish={handleFinishViewingResults} student={activeStudent} />;
                    else { setView('studentPortal'); return null; }
                case 'grading': return <GradingLoader />;
                default: 
                    setView('studentPortal'); 
                    return null;
            }
        }

        let pageContent;
        switch (view) {
            case 'loading': return <ExamGenerationLoader />;
            case 'grading': return <GradingLoader />;
            case 'form':
                pageContent = <div className="flex items-center justify-center p-4"><div className="container mx-auto"><ExamForm onSubmit={handleSubmit} isLoading={isLoading} error={error} initialData={editingExam} onBack={() => handleNavigate('dashboard')}/></div></div>;
                break;
            case 'preview':
                if (currentExam) {
                    pageContent = (
                        <div className="flex flex-col bg-white dark:bg-zinc-950">
                             <div className="px-4 flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                                <div className="container mx-auto py-4 flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => { setCurrentExam(null); handleNavigate('dashboard'); }} className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" title="חזרה לדף הבית">
                                            <ArrowUturnLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300 transform scale-x-[-1]" />
                                        </button>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">תצוגה מקדימה של המבחן</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleStartEdit(currentExam)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"><PencilIcon className="w-5 h-5"/> עריכה</button>
                                        <button onClick={() => handleStartTestDrive(currentExam)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">בצע כמבחן לדוגמה</button>
                                        <button onClick={handleExportToPdf} disabled={isExportingPdf} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 disabled:opacity-50">{isExportingPdf ? 'מייצא...' : 'ייצא ל-PDF'}</button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow" ref={examPreviewRef}>
                                <div className="container mx-auto"><ExamPreview exam={currentExam} /></div>
                            </div>
                        </div>
                    );
                } else { setView('dashboard'); return null; }
                break;
            case 'settings': pageContent = <Settings onBack={() => handleNavigate('dashboard')} />; break;
            case 'students': pageContent = <StudentManagement students={students} onAddStudent={handleAddStudent} onDeleteStudent={handleDeleteStudent} onViewStudent={handleViewStudent} onUpdateStudent={handleUpdateStudent} onBack={() => handleNavigate('dashboard')} />; break;
            case 'studentDetail':
                if (selectedStudent) {
                    pageContent = <StudentDetailView student={selectedStudent} exams={exams} submissions={submissions} onViewSubmission={handleViewSubmission} onBack={() => setView('students')} />;
                } else { setView('students'); return null; }
                break;
            case 'examEditor':
                if (editingExam) pageContent = <ExamEditor exam={editingExam} onSave={handleUpdateExam} onCancel={() => setView('preview')} onOpenChat={() => setIsExamChatOpen(true)} />;
                else { setView('dashboard'); return null; }
                break;
            case 'resultsDashboard':
                pageContent = <ResultsDashboard exams={exams} students={students} submissions={submissions} onViewSubmission={handleViewSubmission} onBack={() => handleNavigate('dashboard')} />;
                break;
            case 'submissionDetail':
                 if (selectedSubmission) {
                    const examForSubmission = exams.find(e => e.id === selectedSubmission.examId);
                    const studentForSubmission = students.find(s => s.id === selectedSubmission.studentId);
                    if (examForSubmission && studentForSubmission) {
                        pageContent = <SubmissionDetailView submission={selectedSubmission} exam={examForSubmission} student={studentForSubmission} onBack={() => selectedStudent ? setView('studentDetail') : setView('resultsDashboard')} />;
                    } else {
                        setView('resultsDashboard'); return null;
                    }
                } else { setView('dashboard'); return null; }
                break;
            case 'examStart':
                if (currentExam && user) return <ExamStartScreen exam={currentExam} user={user} onStart={() => setView('examTaking')} onExit={handleQuitExam} />;
                else { setView('dashboard'); return null; }
            case 'examTaking':
                if(currentExam && user) return <ExamTaking exam={currentExam} user={user} onSubmitExam={handleSubmitExam} onQuitExam={handleQuitExam} />;
                else { setView('dashboard'); return null; }
            case 'results':
                if(submission && currentExam && user) {
                    const testStudent: Student = { id: user.id, name: user.name, class: 'בדיקה', subjects: [], password: '' };
                    return <ExamResults submission={submission} exam={currentExam} onFinish={handleFinishViewingResults} student={testStudent} />;
                }
                else { setView('dashboard'); return null; }
            case 'dashboard':
            default:
                if (user.role === 'teacher') {
                    pageContent = <Dashboard exams={exams} onSelectExam={handleSelectExam} onCreateNew={handleCreateNew} onDelete={handleDeleteExam} onPublish={handlePublishExam} onEdit={handleStartEdit} onNavigate={handleNavigate} onShowCodes={handleShowCodes} />;
                } else {
                    setView('studentPortal');
                    return null;
                }
                break;
        }

        return (
             <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen" dir="rtl">
                {user.role === 'teacher' && <Header 
                    onNavigateHome={handleNavigateHome} 
                    onNavigateToDashboard={() => handleNavigate('dashboard')} 
                    onNavigateToStudents={() => handleNavigate('students')}
                    onNavigateToResults={() => handleNavigate('resultsDashboard')}
                    onNavigateToSettings={() => handleNavigate('settings')} 
                    onLogout={handleLogout} 
                    user={user} 
                />}
                {pageContent}
            </div>
        );
    };

    return (
        <div className="text-gray-900 dark:text-gray-100" dir="rtl">
             <main className="w-full">
                {renderContent()}
             </main>
             <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="אישור מחיקה" message="האם אתה בטוח שברצונך למחוק את המבחן? לא ניתן לשחזר פעולה זו." confirmText="מחק" confirmColor="red" />
             {currentExam && <PublishModal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} exam={currentExam} students={students} />}
             {editingExam && <ExamChat isOpen={isExamChatOpen} onClose={() => setIsExamChatOpen(false)} exam={editingExam} />}
             {renderSupportChat()}
             <AlertModal info={alertInfo} onClose={() => setAlertInfo(null)} />
        </div>
    );
};

export default App;
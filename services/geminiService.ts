import { GoogleGenAI, Type, Part } from "@google/genai";
import type { ExamFormData, Exam, Question, ChatMessage, QuestionType, AnswerOption } from '../types';
import { QUESTION_TYPES } from "../constants";

const answerOptionSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "טקסט התשובה האפשרית." },
        isCorrect: { type: Type.BOOLEAN, description: "חייב להיות true אם זו התשובה הנכונה, אחרת false." }
    },
    required: ['text', 'isCorrect']
};

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "מזהה ייחודי לשאלה (למשל, 'q1')." },
        type: { type: Type.STRING, enum: ['single-choice', 'multiple-choice', 'open-ended'], description: "סוג השאלה." },
        questionText: { type: Type.STRING, description: "גוף השאלה המלא." },
        options: {
            type: Type.ARRAY,
            description: "נדרש עבור שאלות 'single-choice' ו-'multiple-choice'.",
            items: answerOptionSchema
        },
        correctAnswer: { type: Type.STRING, description: "תשובה מופתית עבור שאלות פתוחות. לא רלוונטי לסוגי שאלות אחרים." }
    },
    required: ['id', 'type', 'questionText']
};

const examSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "כותרת מתאימה למבחן, מבוססת על תוכן המסמך." },
    questions: {
        type: Type.ARRAY,
        items: questionSchema,
        description: "מערך של שאלות המבחן."
    }
  },
  required: ["title", "questions"],
};

const gradedAnswerSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "הציון שהוענק לתשובה, מספר בין 0 לניקוד המקסימלי." },
        feedback: { type: Type.STRING, description: "משוב קצר ומנומק המסביר את הציון." }
    },
    required: ['score', 'feedback']
};

const suggestionsSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
};

const newQuestionSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        questionText: { type: Type.STRING, description: "טקסט השאלה המלא." },
        options: {
            type: Type.ARRAY,
            description: "מערך של 4 תשובות אפשריות. נדרש עבור שאלות 'single-choice' ו-'multiple-choice'.",
            items: answerOptionSchema
        }
    },
    required: ['questionText', 'options']
};

const newQuestionSuggestionsSchema = {
    type: Type.ARRAY,
    items: newQuestionSuggestionSchema
};

const fileToGenerativePart = (file: File): Promise<Part> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            resolve({
                inlineData: {
                    mimeType: file.type,
                    data: base64Data
                }
            });
        };
        reader.onerror = error => reject(error);
    });
};

const buildPrompt = (formData: ExamFormData): string => {
  const { numSingleChoice, numMultipleChoice, numOpenEnded } = formData;
  return `
    אתה מומחה חינוכי שתפקידו ליצור מבחן מקיף מהמסמכים המצורפים.
    המטרה שלך היא לנתח את התוכן וליצור שאלות שיבדקו הבנה וידע.
    הפלט חייב להיות אובייקט JSON התואם באופן מלא לסכמה שסופקה.

    --- הנחיות ליצירת המבחן ---
    1.  **נושא המבחן:** קבע כותרת כוללת למבחן שתשקף את הנושא המרכזי של המסמכים.
    2.  **יצירת שאלות:** צור בדיוק את מספר השאלות הבא:
        -   **${numSingleChoice}** שאלות מסוג 'single-choice' (רבות-ברירה עם תשובה נכונה אחת בלבד).
        -   **${numMultipleChoice}** שאלות מסוג 'multiple-choice' (רבות-ברירה עם יותר מתשובה נכונה אפשרית אחת).
        -   **${numOpenEnded}** שאלות מסוג 'open-ended' (שאלות פתוחות הדורשות תשובה מילולית).
    3.  **כללים חשובים לשאלות רבות-ברירה ('single-choice' ו-'multiple-choice'):**
        -   עבור כל שאלה, צור 4 תשובות אפשריות (options).
        -   **עבור 'single-choice':** סמן בדיוק אפשרות אחת כנכונה (\`isCorrect: true\`). כל השאר חייבות להיות \`isCorrect: false\`.
        -   **עבור 'multiple-choice':** סמן לפחות שתי אפשרויות כנכונות (\`isCorrect: true\`).
        -   ודא שהתשובות הלא נכונות (מסיחים) הן סבירות אך שגויות באופן ברור על פי תוכן המסמכים.
    4.  **כללים לשאלות פתוחות ('open-ended'):**
        -   השאלות צריכות לדרוש מהנבחן להפגין הבנה, ניתוח או יישום של החומר, ולא רק שליפת מידע.
        -   **חובה** לספק תשובה מופתית ומלאה בשדה \`correctAnswer\`.
        -   אל תכלול את שדה ה-'options' עבור שאלות מסוג זה.
    5.  **כללי:** ודא שהשאלות מכסות מגוון נושאים מהמסמכים ואינן חוזרות על עצמן. כל השאלות והתשובות חייבות להתבסס אך ורק על המידע הקיים במסמכים המצורפים.
  `;
};

const distributePoints = (questions: Omit<Question, 'points'>[]): Question[] => {
    const numQuestions = questions.length;
    if (numQuestions === 0) return [];
    
    const basePoints = Math.floor(100 / numQuestions);
    let remainder = 100 % numQuestions;

    return questions.map(q => {
        let points = basePoints;
        if (remainder > 0) {
            points++;
            remainder--;
        }
        return { ...q, points };
    });
};

export const generateExamFromDocument = async (formData: ExamFormData, aiModel: string): Promise<Omit<Exam, 'id' | 'status' | 'creationDate' | 'duration' | 'accessCodes'>> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  if (!formData.files || formData.files.length === 0) {
      throw new Error("No file provided for exam generation.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-2.5-pro"; 
  
  const fileParts = await Promise.all(formData.files.map(fileToGenerativePart));
  const textPart = buildPrompt(formData);
  const contents = { parts: [...fileParts, { text: textPart }] };
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
      },
    });

    let jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("AI returned an empty response.");
    }
    
    const generatedExam: { title: string; questions: Omit<Question, 'points'>[] } = JSON.parse(jsonText);
    
    if (!generatedExam.title || !generatedExam.questions || generatedExam.questions.length === 0) {
        throw new Error("AI returned an invalid exam structure.");
    }
    
    const questionsWithPoints = distributePoints(generatedExam.questions);

    return {
        title: generatedExam.title,
        questions: questionsWithPoints,
        sourceFileNames: formData.files.map(f => f.name),
    };
  } catch (error) {
    console.error("Error generating exam:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate exam: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the exam.");
  }
};

export const gradeOpenEndedAnswer = async (
    question: Question,
    studentAnswer: string
): Promise<{ score: number; feedback: string }> => {
    if (!process.env.API_KEY) throw new Error("API key not found.");
    if (!studentAnswer || studentAnswer.trim() === '') return { score: 0, feedback: "התלמיד לא ענה על השאלה." };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = "gemini-2.5-flash";

    const prompt = `
        אתה AI שתפקידו לבדוק תשובה לשאלה פתוחה במבחן.
        הערך את תשובת התלמיד/ה בהתבסס על השאלה והתשובה המופתית שסופקה.
        הענק ציון הוגן. גם אם התשובה של התלמיד/ה שונה מהתשובה המופתית אך עדיין נכונה, יש לתת ניקוד בהתאם.
        הניקוד המקסימלי לשאלה זו הוא ${question.points} נקודות.
        הפלט חייב להיות אובייקט JSON התואם לסכמה.

        --- פרטי השאלה ---
        שאלה: "${question.questionText}"
        תשובה מופתית: "${question.correctAnswer}"
        ניקוד מקסימלי: ${question.points}

        --- תשובת התלמיד/ה ---
        "${studentAnswer}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: gradedAnswerSchema,
            },
        });
        
        let jsonText = response.text.trim();
        const gradedResult: { score: number; feedback: string } = JSON.parse(jsonText);
        
        // Clamp the score to be within the valid range
        gradedResult.score = Math.max(0, Math.min(gradedResult.score, question.points));

        return gradedResult;
    } catch (error) {
        console.error("Error grading open-ended answer:", error);
        return { score: 0, feedback: "אירעה שגיאה בבדיקה האוטומטית של שאלה זו." };
    }
};

export const chatWithExamAssistant = async (message: string, exam: Exam): Promise<Omit<ChatMessage, 'role'>> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = "gemini-2.5-flash";

    const prompt = `אתה עוזר AI למורה העורך מבחן קיים. תפקידך לסייע בעריכת המבחן, להציע שיפורים, ולהשיב על שאלות.
התנהגות נדרשת:
- אם המורה מבקש להוסיף שאלה, נסח שאלה מלאה (כולל תשובות אם רלוונטי) בפורמט ברור שניתן להעתיק.
- אם המורה מבקש לשנות שאלה קיימת (למשל "שנה את שאלה 3"), ספק ניסוח חלופי או הצעה לשיפור.
- אם המורה מבקש להעריך את משך הזמן הסביר למבחן, נתח את כמות ומורכבות השאלות וספק הערכה מנומקת בדקות.
- לשאלות כלליות, ספק תשובה מועילה ורלוונטית למשימת עריכת המבחן.
- התשובות חייבות להיות בעברית.

--- פרטי המבחן הנוכחי ---
כותרת: ${exam.title}
משך זמן נוכחי: ${exam.duration} דקות
מספר שאלות כולל: ${exam.questions.length}
שאלות:
${exam.questions.map((q, i) => `${i + 1}. (${q.points} נק') (${QUESTION_TYPES[q.type]}): ${q.questionText}`).join('\n')}

--- הודעת המורה ---
"${message}"`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return { text: response.text.trim() };
    } catch (error) {
        console.error("Error in chatWithExamAssistant:", error);
        return { text: "מצטער, אירעה שגיאה. אנא נסה שוב מאוחר יותר." };
    }
};

export const getSupportChatResponse = async (message: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please set the API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = "gemini-2.5-flash";

    const prompt = `You are a support agent for an application called "Exam Generator AI".
    You are helpful and friendly.
    A user has a question: "${message}".
    Provide a concise and helpful answer in Hebrew.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error in getSupportChatResponse:", error);
        return "מצטער, אירעה שגיאה. אנא נסה שוב מאוחר יותר.";
    }
};

export type SuggestionType = 'regenerate_question' | 'regenerate_answer' | 'suggest_incorrect_answer' | 'suggest_correct_answer' | 'suggest_new_question';

export const getAiSuggestions = async (
    exam: Exam,
    suggestionType: SuggestionType,
    context: { qIndex?: number; oIndex?: number; questionType?: QuestionType; }
): Promise<any> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = "gemini-2.5-flash";

    let prompt = `אתה עוזר AI למורה העורך מבחן בשם "${exam.title}". המטרה שלך היא לספק הצעות ממוקדות.`;
    const question = context.qIndex !== undefined ? exam.questions[context.qIndex] : null;
    let responseSchema = suggestionsSchema;

    switch (suggestionType) {
        case 'regenerate_question':
            if (!question) throw new Error("Question context is missing.");
            prompt += `\n\nהתשובה שלך חייבת להיות מערך JSON של 3 מחרוזות בעברית, כל אחת ניסוח חלופי לשאלה הבאה:\n"${question.questionText}"`;
            break;
        case 'regenerate_answer':
            if (!question || context.oIndex === undefined) throw new Error("Answer context is missing.");
            prompt += `\n\nבהתייחס לשאלה: "${question.questionText}", התשובה שלך חייבת להיות מערך JSON של 3 מחרוזות בעברית, כל אחת ניסוח חלופי לתשובה הבאה:\n"${question.options![context.oIndex].text}"`;
            break;
        case 'suggest_incorrect_answer':
            if (!question) throw new Error("Question context is missing.");
            const correctAnswers = question.options?.filter(o => o.isCorrect).map(o => o.text).join('", "') || 'אין';
            prompt += `\n\nעבור השאלה: "${question.questionText}", התשובה שלך חייבת להיות מערך JSON של 3 מחרוזות בעברית, כל אחת תשובה אפשרית שגויה אך סבירה. התשובה/ות הנכונה/ות היא/הן: "${correctAnswers}".`;
            break;
        case 'suggest_correct_answer':
            if (!question) throw new Error("Question context is missing.");
            const incorrectAnswers = question.options?.filter(o => !o.isCorrect).map(o => o.text).join('", "') || 'אין';
            prompt += `\n\nעבור השאלה: "${question.questionText}", התשובה שלך חייבת להיות מערך JSON של 3 מחרוזות בעברית, כל אחת תשובה אפשרית נכונה. תשובות שגויות קיימות הן: "${incorrectAnswers}".`;
            break;
        case 'suggest_new_question':
            if (!context.questionType) throw new Error("Question type is missing.");
            const existingQuestions = exam.questions.map(q => `"${q.questionText}"`).join(', ');
            
            if (context.questionType === 'open-ended') {
                prompt += `\n\nהתשובה שלך חייבת להיות מערך JSON של 3 מחרוזות בעברית, כל אחת שאלה חדשה מסוג "פתוחה" שאינה מכוסה כבר במבחן.`;
                prompt += `\nשאלות קיימות: [${existingQuestions}].`;
                responseSchema = suggestionsSchema;
            } else { // 'single-choice' or 'multiple-choice'
                prompt += `\n\nהתשובה שלך חייבת להיות מערך JSON של 3 אובייקטים, כל אחד מייצג שאלה חדשה מסוג "${QUESTION_TYPES[context.questionType]}" שאינה מכוסה כבר במבחן.`;
                prompt += `\nשאלות קיימות: [${existingQuestions}].`;
                prompt += `\nכל אובייקט חייב להכיל 'questionText' (מחרוזת) ו-'options' (מערך של 4 אובייקטי תשובות).`;
                prompt += `\nכל אובייקט תשובה ב-'options' חייב להכיל 'text' (מחרוזת) ו-'isCorrect' (בוליאני).`;
                if (context.questionType === 'single-choice') {
                    prompt += `\nודא שלכל שאלה יש בדיוק תשובה אחת נכונה (\`isCorrect: true\`).`;
                } else if (context.questionType === 'multiple-choice') {
                    prompt += `\nודא שלכל שאלה יש לפחות שתי תשובות נכונות (\`isCorrect: true\`).`;
                }
                responseSchema = newQuestionSuggestionsSchema;
            }
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        let jsonText = response.text.trim();
        const suggestions: any[] = JSON.parse(jsonText);
        return suggestions;
    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        throw new Error("אירעה שגיאה בקבלת הצעות מה-AI.");
    }
};

export const regenerateExamContent = async (exam: Exam): Promise<Omit<Exam, 'id' | 'status' | 'creationDate' | 'duration' | 'accessCodes'>> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-2.5-pro";

  const numSingleChoice = exam.questions.filter(q => q.type === 'single-choice').length;
  const numMultipleChoice = exam.questions.filter(q => q.type === 'multiple-choice').length;
  const numOpenEnded = exam.questions.filter(q => q.type === 'open-ended').length;
  
  const sourceFilesText = exam.sourceFileNames && exam.sourceFileNames.length > 0
    ? `"${exam.sourceFileNames.join('", "')}"`
    : `"${exam.title}"`;

  const prompt = `
    אתה מומחה חינוכי המייצר מחדש מבחן. כותרת המבחן היא "${exam.title}" והוא מבוסס על קובצי המקור ${sourceFilesText}.
    תפקידך הוא לייצר סט חדש לחלוטין של שאלות ותשובות על סמך הנושא.
    המבחן החדש חייב לשמור על אותו מבנה בדיוק כמו המקורי:
    - ${numSingleChoice} שאלות מסוג 'single-choice'.
    - ${numMultipleChoice} שאלות מסוג 'multiple-choice'.
    - ${numOpenEnded} שאלות מסוג 'open-ended'.
    
    עקוב אחר הכללים הבאים בקפדנות:
    1. לכל שאלת 'single-choice', ספק 4 אפשרויות, כאשר בדיוק אחת מסומנת כנכונה (\`isCorrect: true\`).
    2. לכל שאלת 'multiple-choice', ספק 4 אפשרויות, כאשר לפחות שתיים מסומנות כנכונות (\`isCorrect: true\`).
    3. לכל שאלת 'open-ended', חובה לספק תשובה מופתית ומלאה בשדה \`correctAnswer\`. אל תכלול את שדה 'options'.
    4. כל התוכן חייב להיות בעברית.
    5. הפלט חייב להיות אובייקט JSON יחיד התואם לסכמה שסופקה. מאפיין ה-\`title\` ב-JSON חייב להיות "${exam.title}".
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
      },
    });

    let jsonText = response.text.trim();
    const regeneratedContent: { title: string; questions: Omit<Question, 'points'>[] } = JSON.parse(jsonText);

    if (!regeneratedContent.title || !regeneratedContent.questions) {
        throw new Error("AI returned an invalid structure for regeneration.");
    }
    
    const questionsWithPoints = distributePoints(regeneratedContent.questions);

    return {
        title: regeneratedContent.title,
        questions: questionsWithPoints,
        sourceFileNames: exam.sourceFileNames,
    };
  } catch (error) {
    console.error("Error regenerating exam content:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to regenerate exam: ${error.message}`);
    }
    throw new Error("An unknown error occurred while regenerating the exam.");
  }
};
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    writeBatch,
    Timestamp,
} from 'firebase/firestore';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth';
import type { Subject, Quiz, QuizResult, NewSubject, NewQuiz, Question } from './types';

// ─── Firebase Config ─────────────────────────────────────────
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ─── Auth Helpers ────────────────────────────────────────────
export async function loginAdmin(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutAdmin() {
    return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

// ─── Subject CRUD ────────────────────────────────────────────
export async function createSubject(data: NewSubject): Promise<string> {
    const now = Date.now();
    const docRef = await addDoc(collection(db, 'subjects'), {
        ...data,
        quizCount: 0,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
}

export async function getSubjects(): Promise<Subject[]> {
    const q = query(collection(db, 'subjects'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
}

export async function updateSubject(id: string, data: Partial<Subject>) {
    await updateDoc(doc(db, 'subjects', id), { ...data, updatedAt: Date.now() });
}

export async function deleteSubject(id: string) {
    // Delete all quizzes under this subject first
    const quizzes = await getQuizzesBySubject(id);
    for (const quiz of quizzes) {
        await deleteDoc(doc(db, 'quizzes', quiz.id));
    }
    await deleteDoc(doc(db, 'subjects', id));
}

// ─── Quiz CRUD ───────────────────────────────────────────────
export async function createQuiz(data: NewQuiz): Promise<string> {
    const now = Date.now();
    const docRef = await addDoc(collection(db, 'quizzes'), {
        ...data,
        createdAt: now,
        updatedAt: now,
    });
    // Increment subject quiz count
    const subjectRef = doc(db, 'subjects', data.subjectId);
    const subjectSnap = await getDoc(subjectRef);
    if (subjectSnap.exists()) {
        const current = subjectSnap.data().quizCount || 0;
        await updateDoc(subjectRef, { quizCount: current + 1, updatedAt: now });
    }
    return docRef.id;
}

export async function getQuizzesBySubject(subjectId: string): Promise<Quiz[]> {
    const q = query(
        collection(db, 'quizzes'),
        where('subjectId', '==', subjectId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
}

export async function getQuizByAccessCode(accessCode: string): Promise<Quiz | null> {
    const q = query(
        collection(db, 'quizzes'),
        where('accessCode', '==', accessCode.toUpperCase()),
        where('published', '==', true)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Quiz;
}

export async function getQuiz(id: string): Promise<Quiz | null> {
    const d = await getDoc(doc(db, 'quizzes', id));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() } as Quiz;
}

export async function updateQuiz(id: string, data: Partial<Quiz>) {
    await updateDoc(doc(db, 'quizzes', id), { ...data, updatedAt: Date.now() });
}

export async function deleteQuiz(id: string, subjectId: string) {
    await deleteDoc(doc(db, 'quizzes', id));
    // Decrement subject quiz count
    const subjectRef = doc(db, 'subjects', subjectId);
    const subjectSnap = await getDoc(subjectRef);
    if (subjectSnap.exists()) {
        const current = subjectSnap.data().quizCount || 0;
        await updateDoc(subjectRef, { quizCount: Math.max(0, current - 1), updatedAt: Date.now() });
    }
}

// ─── Results ─────────────────────────────────────────────────
export async function submitQuizResult(result: Omit<QuizResult, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'results'), result);
    return docRef.id;
}

export async function getResultsByQuiz(quizId: string): Promise<QuizResult[]> {
    const q = query(
        collection(db, 'results'),
        where('quizId', '==', quizId),
        orderBy('submittedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizResult));
}

export async function getAllResults(): Promise<QuizResult[]> {
    const q = query(collection(db, 'results'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizResult));
}

export async function deleteResult(id: string): Promise<void> {
    await deleteDoc(doc(db, 'results', id));
}

export async function deleteResultsByIds(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    for (const id of ids) {
        batch.delete(doc(db, 'results', id));
    }
    await batch.commit();
}

// ─── Grading Engine ──────────────────────────────────────────
export function gradeQuiz(
    questions: Question[],
    answers: { questionId: string; answer: string }[]
): { score: number; totalPoints: number; percentage: number; gradedAnswers: { questionId: string; answer: string; isCorrect: boolean }[] } {
    let score = 0;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const gradedAnswers = answers.map((a) => {
        const question = questions.find((q) => q.id === a.questionId);
        if (!question) return { ...a, isCorrect: false };

        let isCorrect = false;
        if (question.type === 'multiple-choice') {
            isCorrect = a.answer === question.correctAnswer;
        } else {
            // Text input: case-insensitive, trimmed comparison
            isCorrect =
                a.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        }

        if (isCorrect) score += question.points;
        return { ...a, isCorrect };
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    return { score, totalPoints, percentage, gradedAnswers };
}

// ─── Utility ─────────────────────────────────────────────────
export function generateAccessCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

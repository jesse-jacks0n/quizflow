import { testSections, Question, TestSection } from './test-data';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get all questions from all sections
 */
export function getAllQuestions(): Question[] {
  return testSections.flatMap(section => section.questions);
}

/**
 * Get a specific question by ID
 */
export function getQuestion(questionId: string): Question | undefined {
  return getAllQuestions().find(q => q.id === questionId);
}

/**
 * Get all questions from a specific section
 */
export function getQuestionsForSection(sectionId: string): Question[] {
  const section = testSections.find(s => s.id === sectionId);
  return section ? section.questions : [];
}

/**
 * Calculate total possible points for the entire test
 */
export function getTotalPossiblePoints(): number {
  return getAllQuestions().reduce((total, q) => total + q.points, 0);
}

/**
 * Calculate total possible points for a section
 */
export function getSectionTotalPoints(sectionId: string): number {
  return getQuestionsForSection(sectionId).reduce((total, q) => total + q.points, 0);
}

/**
 * Get sections with randomized questions
 */
export function getRandomizedSections(): TestSection[] {
  return testSections.map(section => ({
    ...section,
    questions: shuffleArray(section.questions)
  }));
}

/**
 * Validate an answer for a multiple choice question
 */
export function validateMultipleChoiceAnswer(
  questionId: string,
  selectedAnswer: string
): boolean {
  const question = getQuestion(questionId);
  if (!question || question.type !== 'multiple-choice') {
    return false;
  }
  return selectedAnswer === question.correctAnswer;
}

/**
 * Format submission timestamp to readable date
 */
export function formatSubmissionDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Calculate statistics for multiple submissions
 */
export function calculateStats(scores: number[]) {
  if (scores.length === 0) {
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      median: 0,
      totalSubmissions: 0
    };
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const average = sum / scores.length;
  const median = scores.length % 2 === 0
    ? (sorted[scores.length / 2 - 1] + sorted[scores.length / 2]) / 2
    : sorted[Math.floor(scores.length / 2)];

  return {
    average: Math.round(average * 100) / 100,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    median,
    totalSubmissions: scores.length
  };
}

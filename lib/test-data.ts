export interface Question {
  id: string;
  section: string;
  text: string;
  type: 'multiple-choice' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface TestSection {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export const testSections: TestSection[] = [
  {
    id: 'section-1',
    name: 'Fundamentals',
    description: 'Basic concepts and foundational knowledge',
    questions: [
      {
        id: 'q1',
        section: 'Fundamentals',
        text: 'Which of the following best defines the primary concept we are studying?',
        type: 'multiple-choice',
        options: [
          'Option A: The first definition',
          'Option B: The second definition',
          'Option C: The third definition',
          'Option D: The fourth definition'
        ],
        correctAnswer: 'Option A: The first definition',
        points: 5
      },
      {
        id: 'q2',
        section: 'Fundamentals',
        text: 'What are the key characteristics and why are they important?',
        type: 'essay',
        points: 10
      },
      {
        id: 'q3',
        section: 'Fundamentals',
        text: 'Which statement accurately describes the relationship between these two concepts?',
        type: 'multiple-choice',
        options: [
          'They are inversely related',
          'They are directly proportional',
          'They are independent',
          'They have no relationship'
        ],
        correctAnswer: 'They are directly proportional',
        points: 5
      },
      {
        id: 'q4',
        section: 'Fundamentals',
        text: 'Explain the mechanism behind this fundamental principle.',
        type: 'essay',
        points: 10
      }
    ]
  },
  {
    id: 'section-2',
    name: 'Applications',
    description: 'Real-world applications and practical scenarios',
    questions: [
      {
        id: 'q5',
        section: 'Applications',
        text: 'In which of the following scenarios would this principle be most applicable?',
        type: 'multiple-choice',
        options: [
          'Scenario A: Business context',
          'Scenario B: Scientific context',
          'Scenario C: Social context',
          'Scenario D: Technical context'
        ],
        correctAnswer: 'Scenario B: Scientific context',
        points: 5
      },
      {
        id: 'q6',
        section: 'Applications',
        text: 'Describe a real-world case study and how these concepts apply.',
        type: 'essay',
        points: 10
      },
      {
        id: 'q7',
        section: 'Applications',
        text: 'Which approach is most effective in this practical situation?',
        type: 'multiple-choice',
        options: [
          'Traditional approach',
          'Modern approach',
          'Hybrid approach',
          'Innovative approach'
        ],
        correctAnswer: 'Hybrid approach',
        points: 5
      },
      {
        id: 'q8',
        section: 'Applications',
        text: 'How would you solve this problem using the learned concepts?',
        type: 'essay',
        points: 10
      }
    ]
  },
  {
    id: 'section-3',
    name: 'Analysis & Synthesis',
    description: 'Critical thinking and advanced problem-solving',
    questions: [
      {
        id: 'q9',
        section: 'Analysis & Synthesis',
        text: 'What is the primary advantage of this method compared to alternatives?',
        type: 'multiple-choice',
        options: [
          'It is faster',
          'It is more accurate',
          'It is less expensive',
          'It is more sustainable'
        ],
        correctAnswer: 'It is more accurate',
        points: 5
      },
      {
        id: 'q10',
        section: 'Analysis & Synthesis',
        text: 'Critically analyze the strengths and weaknesses of this approach.',
        type: 'essay',
        points: 15
      },
      {
        id: 'q11',
        section: 'Analysis & Synthesis',
        text: 'Which combination of factors would lead to the best outcome?',
        type: 'multiple-choice',
        options: [
          'Factors A and B',
          'Factors B and C',
          'Factors C and D',
          'Factors A and D'
        ],
        correctAnswer: 'Factors B and C',
        points: 5
      },
      {
        id: 'q12',
        section: 'Analysis & Synthesis',
        text: 'Synthesize information from different sources to create a comprehensive solution.',
        type: 'essay',
        points: 15
      }
    ]
  }
];

export interface StudentSubmission {
  id: string;
  studentName: string;
  timestamp: number;
  answers: {
    questionId: string;
    answer: string;
  }[];
  totalScore?: number;
  graded?: boolean;
  gradedAnswers?: {
    questionId: string;
    score: number;
    feedback: string;
  }[];
}

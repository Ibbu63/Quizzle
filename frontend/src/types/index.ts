export interface Quiz {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface QuizCreateRequest {
  title: string;
  description?: string;
}

export interface Question {
  id: number;
  questionText: string;
  quiz?: Quiz;
}

export interface QuestionCreateRequest {
  questionText: string;
}

/**
 * Normal quiz-taking option response.
 * Note: The backend GET /api/questions/{id}/options intentionally omits the `correct` field
 * to ensure integrity. The frontend never receives `correct`.
 */
export interface Option {
  id: number;
  optionText: string;
}

/**
 * Admin option type. Used for creating and updating options in the admin management UI.
 */
export interface AdminOption {
  id: number;
  optionText: string;
  correct?: boolean;
}

export interface AdminOptionCreateRequest {
  optionText: string;
  correct: boolean;
}

export interface AnswerRequest {
  questionId: number;
  optionId: number;
}

export interface QuizAttemptRequest {
  quizId?: number;
  answers: AnswerRequest[];
}

export interface QuizAttempt {
  id: number;
  quiz: Quiz;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
}

export interface QuestionWithOptions extends Question {
  options: Option[];
}

export interface AdminQuestionWithOptions extends Question {
  options: AdminOption[];
}


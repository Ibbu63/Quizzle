import api from './axios';
import { QuizAttempt, AnswerRequest, QuizAttemptRequest } from '../types';

/**
 * Submit answers for a quiz.
 * POST /api/quizzes/{quizId}/attempts
 * Body: { answers: [{ questionId, optionId }] }
 */
export const submitQuiz = async (
  quizId: number,
  answers: AnswerRequest[]
): Promise<QuizAttempt> => {
  const payload: QuizAttemptRequest = {
    quizId,
    answers,
  };
  const response = await api.post<QuizAttempt>(`/quizzes/${quizId}/attempts`, payload);
  return response.data;
};

/**
 * Get all attempts for a quiz.
 * GET /api/quizzes/{quizId}/attempts
 */
export const getAttemptsByQuizId = async (quizId: number): Promise<QuizAttempt[]> => {
  const response = await api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts`);
  return response.data;
};

/**
 * Get a single attempt result.
 * GET /api/attempts/{attemptId}
 */
export const getAttemptById = async (attemptId: number): Promise<QuizAttempt> => {
  const response = await api.get<QuizAttempt>(`/attempts/${attemptId}`);
  return response.data;
};


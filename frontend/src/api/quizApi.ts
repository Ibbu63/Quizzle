import api from './axios';
import { Quiz, QuizCreateRequest } from '../types';

export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get<Quiz[]>('/api/quizzes');
  return response.data;
};

export const getQuizById = async (id: number): Promise<Quiz> => {
  const response = await api.get<Quiz>(`/api/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (data: QuizCreateRequest): Promise<Quiz> => {
  const response = await api.post<Quiz>('/api/quizzes', data);
  return response.data;
};

export const updateQuiz = async (
  id: number,
  data: QuizCreateRequest
): Promise<Quiz> => {
  const response = await api.put<Quiz>(`/api/quizzes/${id}`, data);
  return response.data;
};

export const deleteQuiz = async (id: number): Promise<void> => {
  await api.delete(`/api/quizzes/${id}`);
};
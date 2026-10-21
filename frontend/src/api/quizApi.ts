import api from './axios';
import { Quiz, QuizCreateRequest } from '../types';

export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get<Quiz[]>('/quizzes');
  return response.data;
};

export const getQuizById = async (id: number): Promise<Quiz> => {
  const response = await api.get<Quiz>(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (data: QuizCreateRequest): Promise<Quiz> => {
  const response = await api.post<Quiz>('/quizzes', data);
  return response.data;
};

export const updateQuiz = async (id: number, data: QuizCreateRequest): Promise<Quiz> => {
  const response = await api.put<Quiz>(`/quizzes/${id}`, data);
  return response.data;
};

export const deleteQuiz = async (id: number): Promise<void> => {
  await api.delete(`/quizzes/${id}`);
};


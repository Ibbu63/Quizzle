import api from './axios';
import { Question, QuestionCreateRequest } from '../types';

export const getQuestionsByQuizId = async (quizId: number): Promise<Question[]> => {
  const response = await api.get<Question[]>(`/api/quizzes/${quizId}/questions`);
  return response.data;
};

export const getQuestionById = async (id: number): Promise<Question> => {
  const response = await api.get<Question>(`/questions/${id}`);
  return response.data;
};

export const createQuestion = async (
  quizId: number,
  data: QuestionCreateRequest
): Promise<Question> => {
  const response = await api.post<Question>(`/api/quizzes/${quizId}/questions`, data);
  return response.data;
};

export const updateQuestion = async (
  id: number,
  data: QuestionCreateRequest
): Promise<Question> => {
  const response = await api.put<Question>(`/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id: number): Promise<void> => {
  await api.delete(`/questions/${id}`);
};


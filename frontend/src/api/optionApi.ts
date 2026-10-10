import api from './axios';
import { Option, AdminOption, AdminOptionCreateRequest } from '../types';

/**
 * Normal endpoint for quiz taking. Does NOT include `correct`.
 */
export const getOptionsByQuestionId = async (questionId: number): Promise<Option[]> => {
  const response = await api.get<Option[]>(`/questions/${questionId}/options`);
  return response.data;
};

/**
 * Normal endpoint to get one option. Does NOT include `correct`.
 */
export const getOptionById = async (id: number): Promise<Option> => {
  const response = await api.get<Option>(`/options/${id}`);
  return response.data;
};

/**
 * Admin endpoint: create an option with `correct` flag.
 */
export const createOption = async (
  questionId: number,
  data: AdminOptionCreateRequest
): Promise<AdminOption> => {
  const response = await api.post<AdminOption>(`/questions/${questionId}/options`, data);
  return response.data;
};

/**
 * Admin endpoint: update an option (text and/or correct flag).
 */
export const updateOption = async (
  id: number,
  data: AdminOptionCreateRequest
): Promise<AdminOption> => {
  const response = await api.put<AdminOption>(`/options/${id}`, data);
  return response.data;
};

/**
 * Admin endpoint: delete an option.
 */
export const deleteOption = async (id: number): Promise<void> => {
  await api.delete(`/options/${id}`);
};


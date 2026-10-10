import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { QuizListPage } from './pages/QuizListPage';
import { QuizDetailsPage } from './pages/QuizDetailsPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { AttemptHistoryPage } from './pages/AttemptHistoryPage';
import { AdminQuizListPage } from './pages/admin/AdminQuizListPage';
import { AdminQuizFormPage } from './pages/admin/AdminQuizFormPage';
import { AdminQuestionManagePage } from './pages/admin/AdminQuestionManagePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Quiz Routes */}
          <Route index element={<HomePage />} />
          <Route path="quizzes" element={<QuizListPage />} />
          <Route path="quizzes/:quizId" element={<QuizDetailsPage />} />
          <Route path="quizzes/:quizId/attempts" element={<AttemptHistoryPage />} />
          <Route path="attempts/:attemptId" element={<QuizResultPage />} />

          {/* Admin Management Routes */}
          <Route path="admin/quizzes" element={<AdminQuizListPage />} />
          <Route path="admin/quizzes/create" element={<AdminQuizFormPage />} />
          <Route path="admin/quizzes/:quizId/edit" element={<AdminQuizFormPage />} />
          <Route
            path="admin/quizzes/:quizId/questions"
            element={<AdminQuestionManagePage />}
          />

          {/* 404 Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;


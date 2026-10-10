import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Save,
  Check,
  ExternalLink,
} from 'lucide-react';
import { getQuizById } from '../../api/quizApi';
import {
  getQuestionsByQuizId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../api/questionApi';
import {
  getOptionsByQuestionId,
  createOption,
  updateOption,
  deleteOption,
} from '../../api/optionApi';
import { Quiz, AdminQuestionWithOptions, AdminOption } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminQuestionManagePage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<AdminQuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Question Modals & State
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<{ id: number; text: string } | null>(null);
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);

  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Option Modals & State
  const [targetQuestionForOption, setTargetQuestionForOption] = useState<number | null>(null);
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);

  const [editingOption, setEditingOption] = useState<{
    id: number;
    questionId: number;
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [isUpdatingOption, setIsUpdatingOption] = useState(false);

  const [deletingOptionInfo, setDeletingOptionInfo] = useState<{
    id: number;
    questionId: number;
    text: string;
  } | null>(null);
  const [isDeletingOption, setIsDeletingOption] = useState(false);

  // Load all questions and options for this quiz
  const loadData = useCallback(async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      setError(null);
      const parsedQuizId = Number(quizId);

      const [quizData, questionsList] = await Promise.all([
        getQuizById(parsedQuizId),
        getQuestionsByQuizId(parsedQuizId),
      ]);

      setQuiz(quizData);

      // Fetch options for each question
      const questionsWithOptions: AdminQuestionWithOptions[] = await Promise.all(
        questionsList.map(async (q) => {
          const rawOptions = await getOptionsByQuestionId(q.id);
          // Convert to AdminOption format
          const adminOpts: AdminOption[] = rawOptions.map((o) => ({
            id: o.id,
            optionText: o.optionText,
          }));
          return {
            ...q,
            options: adminOpts,
          };
        })
      );

      setQuestions(questionsWithOptions);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load question studio';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Add Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId || !newQuestionText.trim()) return;

    try {
      setIsAddingQuestion(true);
      const created = await createQuestion(Number(quizId), {
        questionText: newQuestionText.trim(),
      });

      setQuestions((prev) => [
        ...prev,
        {
          ...created,
          options: [],
        },
      ]);
      setNewQuestionText('');
      setShowAddQuestionModal(false);
    } catch (err: unknown) {
      alert(`Error creating question: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Handler: Update Question
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.text.trim()) return;

    try {
      setIsUpdatingQuestion(true);
      const updated = await updateQuestion(editingQuestion.id, {
        questionText: editingQuestion.text.trim(),
      });

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id ? { ...q, questionText: updated.questionText } : q
        )
      );
      setEditingQuestion(null);
    } catch (err: unknown) {
      alert(`Error updating question: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsUpdatingQuestion(false);
    }
  };

  // Handler: Delete Question
  const handleDeleteQuestion = async () => {
    if (!deletingQuestionId) return;

    try {
      setIsDeletingQuestion(true);
      await deleteQuestion(deletingQuestionId);
      setQuestions((prev) => prev.filter((q) => q.id !== deletingQuestionId));
      setDeletingQuestionId(null);
    } catch (err: unknown) {
      alert(`Error deleting question: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  // Handler: Add Option
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuestionForOption || !newOptionText.trim()) return;

    try {
      setIsAddingOption(true);
      const created = await createOption(targetQuestionForOption, {
        optionText: newOptionText.trim(),
        correct: newOptionIsCorrect,
      });

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === targetQuestionForOption
            ? {
                ...q,
                options: [
                  ...q.options,
                  {
                    id: created.id,
                    optionText: created.optionText,
                    correct: newOptionIsCorrect,
                  },
                ],
              }
            : q
        )
      );

      setNewOptionText('');
      setNewOptionIsCorrect(false);
      setTargetQuestionForOption(null);
    } catch (err: unknown) {
      alert(`Error adding option: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsAddingOption(false);
    }
  };

  // Handler: Update Option
  const handleUpdateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption || !editingOption.text.trim()) return;

    try {
      setIsUpdatingOption(true);
      const updated = await updateOption(editingOption.id, {
        optionText: editingOption.text.trim(),
        correct: editingOption.isCorrect,
      });

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingOption.questionId
            ? {
                ...q,
                options: q.options.map((opt) =>
                  opt.id === editingOption.id
                    ? {
                        ...opt,
                        optionText: updated.optionText,
                        correct: editingOption.isCorrect,
                      }
                    : opt
                ),
              }
            : q
        )
      );
      setEditingOption(null);
    } catch (err: unknown) {
      alert(`Error updating option: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsUpdatingOption(false);
    }
  };

  // Handler: Toggle correct answer directly from option item
  const handleToggleCorrectOption = async (
    option: AdminOption,
    questionId: number
  ) => {
    try {
      const toggledState = !option.correct;
      await updateOption(option.id, {
        optionText: option.optionText,
        correct: toggledState,
      });

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.map((opt) =>
                  opt.id === option.id ? { ...opt, correct: toggledState } : opt
                ),
              }
            : q
        )
      );
    } catch (err: unknown) {
      alert(`Failed to toggle option correctness: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  };

  // Handler: Delete Option
  const handleDeleteOption = async () => {
    if (!deletingOptionInfo) return;

    try {
      setIsDeletingOption(true);
      await deleteOption(deletingOptionInfo.id);

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === deletingOptionInfo.questionId
            ? {
                ...q,
                options: q.options.filter((opt) => opt.id !== deletingOptionInfo.id),
              }
            : q
        )
      );
      setDeletingOptionInfo(null);
    } catch (err: unknown) {
      alert(`Error deleting option: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setIsDeletingOption(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading questions and answer keys..." fullPage />;
  }

  if (error || !quiz) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Could Not Load Questions"
          message={error || 'Quiz not found'}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <Link
            to="/admin/quizzes"
            className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to All Quizzes</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Manage Questions & Options
            </h1>
            <Badge variant="primary" size="md">
              {quiz.title}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Define questions, choices, and designate correct answer options for assessment scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/quizzes/${quiz.id}`} target="_blank">
            <Button
              variant="outline"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Test Quiz
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddQuestionModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="w-6 h-6" />}
          title="No questions in this quiz"
          description="Build your quiz by adding its first question and accompanying options below."
          actionText="Add First Question"
          onAction={() => setShowAddQuestionModal(true)}
        />
      ) : (
        <div className="space-y-6">
          {questions.map((question, qIdx) => (
            <Card
              key={question.id}
              className="p-6 bg-zinc-900/80 border-zinc-800/80 space-y-6"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 max-w-2xl">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white leading-snug">
                      {question.questionText}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Question ID: #{question.id} • {question.options.length} Options configured
                    </p>
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingQuestion({ id: question.id, text: question.questionText })
                    }
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit Text
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingQuestionId(question.id)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete Question
                  </Button>
                </div>
              </div>

              {/* Options Section */}
              <div className="pt-4 border-t border-zinc-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Choices / Options
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetQuestionForOption(question.id);
                      setNewOptionText('');
                      setNewOptionIsCorrect(false);
                    }}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Option
                  </Button>
                </div>

                {question.options.length === 0 ? (
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center text-xs text-zinc-400">
                    No options created yet for this question. Click "Add Option" above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {question.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            opt.correct
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-200'
                              : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                          }`}
                        >
                          {/* Option text and letter */}
                          <div className="flex items-center space-x-3 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                                opt.correct
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {opt.optionText}
                            </span>
                          </div>

                          {/* Option status & actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Toggle Correct Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleCorrectOption(opt, question.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                                opt.correct
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                              }`}
                              title="Click to toggle whether this option is marked as correct"
                            >
                              {opt.correct ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Correct Answer</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                  <span>Mark Correct</span>
                                </>
                              )}
                            </button>

                            {/* Edit Option */}
                            <button
                              onClick={() =>
                                setEditingOption({
                                  id: opt.id,
                                  questionId: question.id,
                                  text: opt.optionText,
                                  isCorrect: Boolean(opt.correct),
                                })
                              }
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                              title="Edit Option"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Option */}
                            <button
                              onClick={() =>
                                setDeletingOptionInfo({
                                  id: opt.id,
                                  questionId: question.id,
                                  text: opt.optionText,
                                })
                              }
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                              title="Delete Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add Question */}
      <Modal
        isOpen={showAddQuestionModal}
        onClose={() => setShowAddQuestionModal(false)}
        title="Add Question to Quiz"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Question Text <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Which team won the UEFA Champions League in 2024?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowAddQuestionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isAddingQuestion}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Question */}
      <Modal
        isOpen={editingQuestion !== null}
        onClose={() => setEditingQuestion(null)}
        title="Edit Question"
      >
        {editingQuestion && (
          <form onSubmit={handleUpdateQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Question Text <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={editingQuestion.text}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, text: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setEditingQuestion(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isUpdatingQuestion}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Update Question
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Add Option */}
      <Modal
        isOpen={targetQuestionForOption !== null}
        onClose={() => setTargetQuestionForOption(null)}
        title="Add Option Choice"
      >
        <form onSubmit={handleAddOption} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Option Text <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Real Madrid"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <input
              type="checkbox"
              id="isCorrectCheckbox"
              checked={newOptionIsCorrect}
              onChange={(e) => setNewOptionIsCorrect(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 bg-zinc-900 border-zinc-700"
            />
            <label
              htmlFor="isCorrectCheckbox"
              className="text-sm font-medium text-zinc-300 cursor-pointer select-none"
            >
              Mark this option as correct answer
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setTargetQuestionForOption(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isAddingOption}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Option
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Option */}
      <Modal
        isOpen={editingOption !== null}
        onClose={() => setEditingOption(null)}
        title="Edit Option Choice"
      >
        {editingOption && (
          <form onSubmit={handleUpdateOption} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Option Text <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={editingOption.text}
                onChange={(e) =>
                  setEditingOption({ ...editingOption, text: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <input
                type="checkbox"
                id="editIsCorrectCheckbox"
                checked={editingOption.isCorrect}
                onChange={(e) =>
                  setEditingOption({ ...editingOption, isCorrect: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 bg-zinc-900 border-zinc-700"
              />
              <label
                htmlFor="editIsCorrectCheckbox"
                className="text-sm font-medium text-zinc-300 cursor-pointer select-none"
              >
                Mark this option as correct answer
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setEditingOption(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isUpdatingOption}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Update Option
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete Question */}
      <ConfirmDialog
        isOpen={deletingQuestionId !== null}
        onClose={() => setDeletingQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? All associated options and answers will be permanently removed."
        confirmText="Delete Question"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeletingQuestion}
      />

      {/* Confirmation Dialog: Delete Option */}
      <ConfirmDialog
        isOpen={deletingOptionInfo !== null}
        onClose={() => setDeletingOptionInfo(null)}
        onConfirm={handleDeleteOption}
        title="Delete Option"
        message={`Are you sure you want to remove the option "${deletingOptionInfo?.text}"?`}
        confirmText="Delete Option"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeletingOption}
      />
    </div>
  );
};

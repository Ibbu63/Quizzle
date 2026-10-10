import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Keyboard,
  Clock,
} from 'lucide-react';
import { getQuizById } from '../api/quizApi';
import { getQuestionsByQuizId } from '../api/questionApi';
import { getOptionsByQuestionId } from '../api/optionApi';
import { submitQuiz } from '../api/attemptApi';
import { Quiz, QuestionWithOptions } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const QuizDetailsPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track answers: { [questionId: number]: optionId: number }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load quiz, questions, and their options
  const loadQuizData = useCallback(async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      setError(null);
      const parsedId = Number(quizId);

      // 1. Fetch Quiz details
      const quizData = await getQuizById(parsedId);
      setQuiz(quizData);

      // 2. Fetch Questions
      const questionsData = await getQuestionsByQuizId(parsedId);

      // 3. For each question, fetch options in parallel
      // Note: GET /api/questions/{id}/options does NOT return `correct`
      const questionsWithOptions: QuestionWithOptions[] = await Promise.all(
        questionsData.map(async (q) => {
          const options = await getOptionsByQuestionId(q.id);
          return {
            ...q,
            options,
          };
        })
      );

      setQuestions(questionsWithOptions);
      setCurrentIndex(0);
      setSelectedAnswers({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load quiz';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  // Handle selecting an option
  const handleSelectOption = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/modal
      if (showConfirmModal || isSubmitting) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      // Number keys 1-9 or A-D to select option
      const optKeys = ['1', '2', '3', '4', 'a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'];
      if (optKeys.includes(e.key)) {
        let index = -1;
        if (['1', '2', '3', '4'].includes(e.key)) {
          index = parseInt(e.key) - 1;
        } else {
          index = e.key.toLowerCase().charCodeAt(0) - 97;
        }
        if (index >= 0 && index < currentQ.options.length) {
          handleSelectOption(currentQ.id, currentQ.options[index].id);
        }
      }

      // ArrowRight to go next
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
      // ArrowLeft to go previous
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, showConfirmModal, isSubmitting]);

  // Submit attempt
  const handleSubmitQuiz = async () => {
    if (!quizId) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Convert answers state { [questionId]: optionId } to array of AnswerRequest
      const answersArray = Object.entries(selectedAnswers).map(
        ([qId, optId]) => ({
          questionId: Number(qId),
          optionId: Number(optId),
        })
      );

      const parsedQuizId = Number(quizId);
      const attemptResult = await submitQuiz(parsedQuizId, answersArray);

      setShowConfirmModal(false);
      // Navigate directly to result page
      navigate(`/attempts/${attemptResult.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit quiz';
      setSubmitError(msg);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing questions & options..." fullPage />;
  }

  if (error || !quiz) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Quiz Loading Failed"
          message={error || 'Quiz not found'}
          onRetry={loadQuizData}
        />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Questions in This Quiz</h2>
        <p className="text-sm text-zinc-400">
          This quiz doesn't have any questions configured yet. You can add questions in the Admin Studio.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link to="/quizzes">
            <Button variant="secondary" size="md">
              Back to Quizzes
            </Button>
          </Link>
          <Link to={`/admin/quizzes/${quiz.id}/questions`}>
            <Button size="md">Add Questions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const currentAnswer = selectedAnswers[currentQuestion.id];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Info */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <Link
          to="/quizzes"
          className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Exit Quiz</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {quiz.title}
          </Badge>
          <Badge
            variant={isAllAnswered ? 'success' : 'neutral'}
            size="sm"
          >
            {answeredCount}/{totalQuestions} Answered
          </Badge>
        </div>
      </div>

      {/* Progress Bar & Question Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="flex items-center gap-1 font-mono text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            {progressPercent}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Submit Error alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Submission failed</p>
            <p className="text-xs text-rose-400/90 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Question Card */}
      <Card className="p-6 sm:p-8 space-y-8">
        {/* Question Text */}
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
            Question {currentIndex + 1}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = currentAnswer === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-150 flex items-center justify-between group ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="text-sm sm:text-base font-medium leading-relaxed">
                    {option.optionText}
                  </span>
                </div>

                <div className="shrink-0 ml-4">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Question Selector Quick Dots */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-900'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Use keys A-D or 1-4 to select, Arrow keys to navigate</span>
          </div>
        </div>
      </Card>

      {/* Navigation & Submission Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {currentIndex < totalQuestions - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowConfirmModal(true)}
              disabled={!isAllAnswered || isSubmitting}
              isLoading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Warning banner if on last question and questions remain unanswered */}
      {currentIndex === totalQuestions - 1 && !isAllAnswered && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              You must answer all {totalQuestions} questions before submitting. (
              {totalQuestions - answeredCount} remaining)
            </span>
          </div>
          <button
            onClick={() => {
              // jump to first unanswered question
              const firstUnansweredIndex = questions.findIndex(
                (q) => selectedAnswers[q.id] === undefined
              );
              if (firstUnansweredIndex !== -1) {
                setCurrentIndex(firstUnansweredIndex);
              }
            }}
            className="text-amber-400 font-semibold underline hover:text-amber-300"
          >
            Go to unanswered
          </button>
        </div>
      )}

      {/* Confirmation Dialog before Final Submit */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmitQuiz}
        title="Submit Assessment"
        message={`You are about to submit your quiz answers for "${quiz.title}". You have answered all ${totalQuestions} questions. Are you ready to see your results?`}
        confirmText="Confirm & Submit"
        cancelText="Review Answers"
        confirmVariant="primary"
        isLoading={isSubmitting}
      />
    </div>
  );
};


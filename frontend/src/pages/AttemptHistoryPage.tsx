import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  History,
  Trophy,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { getAttemptsByQuizId } from '../api/attemptApi';
import { getQuizById } from '../api/quizApi';
import { Quiz, QuizAttempt } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const AttemptHistoryPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      setError(null);
      const parsedId = Number(quizId);

      // Fetch quiz and attempts concurrently
      const [quizData, attemptsData] = await Promise.all([
        getQuizById(parsedId).catch(() => null),
        getAttemptsByQuizId(parsedId),
      ]);

      setQuiz(quizData);
      // Sort newest first
      const sorted = [...attemptsData].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setAttempts(sorted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attempt history';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LoadingSpinner message="Loading attempt history..." fullPage />;
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Failed to Load History"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  // Calculate best and average scores
  const bestPercentage = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const avgPercentage =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <Link
            to="/quizzes"
            className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to All Quizzes</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Attempt History</span>
            {quiz && (
              <Badge variant="primary" size="md">
                {quiz.title}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-zinc-400">
            Review past scores, progression, and evaluation timestamps.
          </p>
        </div>

        {quizId && (
          <div className="flex items-center gap-3">
            <Link to={`/quizzes/${quizId}`}>
              <Button size="md" icon={<RotateCcw className="w-4 h-4" />}>
                Take Quiz Now
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Summary KPI Cards if attempts exist */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-xs uppercase font-medium tracking-wider text-zinc-400">
              Total Attempts
            </p>
            <p className="text-2xl font-bold text-white mt-1">{attempts.length}</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase font-medium tracking-wider text-zinc-400">
              Best Score
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-emerald-400">{Math.round(bestPercentage)}%</p>
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase font-medium tracking-wider text-zinc-400">
              Average Score
            </p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{avgPercentage}%</p>
          </Card>
        </div>
      )}

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No attempts recorded yet"
          description="You haven't completed any attempts for this quiz yet. Take the quiz to see your progress here."
          actionText="Start This Quiz"
          onAction={() => (window.location.href = `/quizzes/${quizId}`)}
        />
      ) : (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/90 text-xs uppercase font-semibold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Attempt #
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Percentage
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {attempts.map((item) => {
                  const isPerfect = item.percentage === 100;
                  const isPass = item.percentage >= 60;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-850/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-white">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">
                          {item.score}
                        </span>{' '}
                        <span className="text-zinc-500">/ {item.totalQuestions}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            isPerfect
                              ? 'success'
                              : isPass
                              ? 'primary'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {Math.round(item.percentage)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{new Date(item.submittedAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/attempts/${item.id}`}>
                          <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                            View Result
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {attempts.map((item) => {
              const isPerfect = item.percentage === 100;
              const isPass = item.percentage >= 60;
              return (
                <Card key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      Attempt #{item.id}
                    </span>
                    <Badge
                      variant={
                        isPerfect
                          ? 'success'
                          : isPass
                          ? 'primary'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {Math.round(item.percentage)}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Score:</span>
                    <span className="font-bold text-white">
                      {item.score} / {item.totalQuestions}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.submittedAt).toLocaleString()}</span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <Link to={`/attempts/${item.id}`} className="w-full block">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Result Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

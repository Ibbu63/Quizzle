import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Layers,
  History,
  CheckCircle2,
  Calendar,
  Flame,
  PlusCircle,
} from 'lucide-react';
import { getQuizzes } from '../api/quizApi';
import { getAttemptsByQuizId } from '../api/attemptApi';
import { Quiz, QuizAttempt } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const HomePage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizList = await getQuizzes();
      setQuizzes(quizList);

      // Fetch attempts for the quizzes (if any exist) to populate recent activity
      if (quizList.length > 0) {
        const attemptPromises = quizList.slice(0, 5).map((q) =>
          getAttemptsByQuizId(q.id).catch(() => [] as QuizAttempt[])
        );
        const attemptsArrays = await Promise.all(attemptPromises);
        const allAttempts = attemptsArrays
          .flat()
          .sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )
          .slice(0, 5);
        setRecentAttempts(allAttempts);
      } else {
        setRecentAttempts([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load quizzes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Connecting to quiz engine..." fullPage />;
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Could not connect to backend"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const totalQuizzes = quizzes.length;
  const totalAttemptsCount = recentAttempts.length;

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Knowledge Assessment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Challenge Your Mind. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-white">
              Evaluate Real Understanding.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Take live assessments powered by our high-performance backend. Track
            scores, test your mastery across categories, and review historical performance.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/quizzes">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Explore All Quizzes
              </Button>
            </Link>
            <Link to="/admin/quizzes">
              <Button variant="secondary" size="lg" icon={<PlusCircle className="w-4 h-4" />}>
                Admin Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Available Quizzes
              </p>
              <h3 className="text-3xl font-bold text-white mt-1">{totalQuizzes}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Logged Attempts
              </p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {totalAttemptsCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                System Health
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white">Online</h3>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Sections: Quizzes & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Featured Quizzes (2 columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Featured Quizzes
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pick a topic to start testing your knowledge immediately.
              </p>
            </div>
            {quizzes.length > 0 && (
              <Link
                to="/quizzes"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
              >
                <span>View all ({quizzes.length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {quizzes.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-6 h-6" />}
              title="No quizzes available"
              description="Get started by creating your first quiz through the Admin Studio."
              actionText="Create a Quiz"
              onAction={() => (window.location.href = '/admin/quizzes/create')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.slice(0, 4).map((quiz) => (
                <Card
                  key={quiz.id}
                  hoverable
                  className="p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="primary" size="sm">
                        Quiz #{quiz.id}
                      </Badge>
                      {quiz.createdAt && (
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug line-clamp-1">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {quiz.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <Link
                      to={`/quizzes/${quiz.id}/attempts`}
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History</span>
                    </Link>
                    <Link to={`/quizzes/${quiz.id}`}>
                      <Button size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Start Quiz
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity / Attempts (1 column wide) */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live submission records from students & users.
            </p>
          </div>

          <Card className="p-5">
            {recentAttempts.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No attempts logged yet</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Complete a quiz to view your attempt records here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {recentAttempts.map((attempt) => {
                  const isPerfect = attempt.percentage === 100;
                  const isGood = attempt.percentage >= 60;
                  return (
                    <div
                      key={attempt.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {attempt.quiz?.title || `Quiz #${attempt.id}`}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Score:{' '}
                          <span className="text-zinc-200 font-medium">
                            {attempt.score}/{attempt.totalQuestions}
                          </span>{' '}
                          •{' '}
                          {new Date(attempt.submittedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            isPerfect
                              ? 'success'
                              : isGood
                              ? 'primary'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {Math.round(attempt.percentage)}%
                        </Badge>
                        <Link to={`/attempts/${attempt.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};


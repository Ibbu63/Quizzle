import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  RotateCcw,
  History,
  Layers,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { getAttemptById } from '../api/attemptApi';
import { QuizAttempt } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const QuizResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    if (!attemptId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAttemptById(Number(attemptId));
      setAttempt(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attempt result';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (loading) {
    return <LoadingSpinner message="Calculating assessment results..." fullPage />;
  }

  if (error || !attempt) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Attempt Result Not Found"
          message={error || 'No attempt record found for this ID'}
          onRetry={fetchResult}
        />
      </div>
    );
  }

  const { quiz, score, totalQuestions, percentage, submittedAt, id } = attempt;
  const incorrect = totalQuestions - score;
  const roundedPercentage = Math.round(percentage);

  // Determine performance feedback
  const getFeedback = (pct: number) => {
    if (pct === 100) {
      return {
        badge: 'success' as const,
        title: 'Perfect Score!',
        subtitle: 'Outstanding mastery. You answered every single question correctly!',
        accentColor: 'text-emerald-400',
        strokeColor: '#10b981',
      };
    }
    if (pct >= 80) {
      return {
        badge: 'primary' as const,
        title: 'Excellent Job!',
        subtitle: 'Great comprehension! You have a solid grasp of this topic.',
        accentColor: 'text-indigo-400',
        strokeColor: '#6366f1',
      };
    }
    if (pct >= 60) {
      return {
        badge: 'primary' as const,
        title: 'Good Effort!',
        subtitle: 'You passed with a respectable score. Review missed points to improve further.',
        accentColor: 'text-indigo-400',
        strokeColor: '#6366f1',
      };
    }
    if (pct >= 40) {
      return {
        badge: 'warning' as const,
        title: 'Keep Practicing!',
        subtitle: 'You are on your way, but reviewing key topics will boost your performance.',
        accentColor: 'text-amber-400',
        strokeColor: '#f59e0b',
      };
    }
    return {
      badge: 'danger' as const,
      title: 'Needs Improvement',
      subtitle: 'Review the subject material carefully and give it another try!',
      accentColor: 'text-rose-400',
      strokeColor: '#f43f5e',
    };
  };

  const feedback = getFeedback(roundedPercentage);

  // SVG Circular progress gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (roundedPercentage / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Quiz Title Banner */}
      <div className="text-center space-y-2">
        <Badge variant={feedback.badge} size="md">
          {feedback.title}
        </Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Quiz Assessment Completed
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Result for{' '}
          <span className="font-semibold text-zinc-200">{quiz?.title}</span>
        </p>
      </div>

      {/* Main Score Showcase Card */}
      <Card className="p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Gauge */}
        <div className="relative inline-flex items-center justify-center my-4">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-800"
              fill="transparent"
            />
            {/* Foreground Score Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke={feedback.strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {roundedPercentage}%
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
              Final Score
            </span>
          </div>
        </div>

        {/* Motivational Subtitle */}
        <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed mt-2">
          {feedback.subtitle}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-8 mt-8 border-t border-zinc-800/80">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-emerald-400 text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct</span>
            </div>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs font-medium mb-1">
              <XCircle className="w-4 h-4" />
              <span>Incorrect</span>
            </div>
            <p className="text-2xl font-bold text-white">{incorrect}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-center space-x-1.5 text-indigo-400 text-xs font-medium mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalQuestions}</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 pt-6 mt-6 border-t border-zinc-800/50">
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Attempt #{id}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(submittedAt).toLocaleString()}
          </span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {quiz?.id && (
          <Link to={`/quizzes/${quiz.id}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Retake Quiz
            </Button>
          </Link>
        )}

        {quiz?.id && (
          <Link to={`/quizzes/${quiz.id}/attempts`} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              icon={<History className="w-4 h-4" />}
            >
              Attempt History
            </Button>
          </Link>
        )}

        <Link to="/quizzes" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            icon={<Layers className="w-4 h-4" />}
          >
            All Quizzes
          </Button>
        </Link>
      </div>
    </div>
  );
};


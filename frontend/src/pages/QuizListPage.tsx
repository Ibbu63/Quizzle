import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Layers,
  ArrowRight,
  History,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { getQuizzes } from '../api/quizApi';
import { Quiz } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const QuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load quizzes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;
    const query = searchQuery.toLowerCase();
    return quizzes.filter(
      (q) =>
        q.title.toLowerCase().includes(query) ||
        (q.description && q.description.toLowerCase().includes(query))
    );
  }, [quizzes, searchQuery]);

  if (loading) {
    return <LoadingSpinner message="Loading all quizzes..." fullPage />;
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Unable to load quizzes"
          message={error}
          onRetry={fetchQuizzes}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Explore All Quizzes
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Select a quiz to test your comprehension and benchmark your score.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by topic or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid of Quizzes */}
      {filteredQuizzes.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            title="No matching quizzes found"
            description={`We couldn't find any quizzes matching "${searchQuery}". Try a different keyword.`}
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <EmptyState
            icon={<Layers className="w-6 h-6" />}
            title="No quizzes available"
            description="There are currently no quizzes registered in the backend. Add one via Admin."
            actionText="Create Quiz"
            onAction={() => (window.location.href = '/admin/quizzes/create')}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              hoverable
              className="p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="primary" size="sm">
                    Quiz #{quiz.id}
                  </Badge>
                  {quiz.createdAt && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(quiz.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                    {quiz.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <Link
                  to={`/quizzes/${quiz.id}/attempts`}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Attempt History</span>
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
  );
};


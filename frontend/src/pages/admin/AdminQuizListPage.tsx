import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ListPlus,
  ExternalLink,
  Layers,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { getQuizzes, deleteQuiz } from '../../api/quizApi';
import { Quiz } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminQuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteQuiz(deletingId);
      setQuizzes((prev) => prev.filter((q) => q.id !== deletingId));
      setDeletingId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete quiz';
      alert(`Error: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quizzes for admin..." fullPage />;
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Admin Error"
          message={error}
          onRetry={fetchQuizzes}
        />
      </div>
    );
  }

  const quizToDelete = quizzes.find((q) => q.id === deletingId);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Management</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Quiz Management Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create, update, organize quiz questions, options, and scoring definitions.
          </p>
        </div>

        <Link to="/admin/quizzes/create">
          <Button icon={<Plus className="w-4 h-4" />}>
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title="No quizzes found"
          description="Your database currently has no quizzes. Click below to create your first quiz."
          actionText="Create Quiz"
          onAction={() => (window.location.href = '/admin/quizzes/create')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="p-6 transition-all hover:border-zinc-700 bg-zinc-900/80"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left content */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      ID: #{quiz.id}
                    </Badge>
                    {quiz.createdAt && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(quiz.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {quiz.description || 'No description provided.'}
                  </p>
                </div>

                {/* Right actions */}
                <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                  <Link to={`/admin/quizzes/${quiz.id}/questions`}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ListPlus className="w-4 h-4" />}
                    >
                      Manage Questions
                    </Button>
                  </Link>

                  <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit2 className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                  </Link>

                  <Link to={`/quizzes/${quiz.id}`} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink className="w-4 h-4" />}
                      title="Open user quiz view"
                    >
                      Preview
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingId(quiz.id)}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quizToDelete?.title || 'this quiz'}"? This will permanently delete the quiz and all associated questions and attempts.`}
        confirmText="Delete Quiz"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};


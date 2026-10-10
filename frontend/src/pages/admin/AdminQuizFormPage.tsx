import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { getQuizById, createQuiz, updateQuiz } from '../../api/quizApi';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminQuizFormPage: React.FC = () => {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(quizId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && quizId) {
      const fetchQuiz = async () => {
        try {
          setLoading(true);
          const data = await getQuizById(Number(quizId));
          setTitle(data.title);
          setDescription(data.description || '');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to load quiz details';
          setErrorMessage(msg);
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [isEditMode, quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Quiz title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && quizId) {
        await updateQuiz(Number(quizId), {
          title: trimmedTitle,
          description: description.trim(),
        });
        navigate('/admin/quizzes');
      } else {
        const created = await createQuiz({
          title: trimmedTitle,
          description: description.trim(),
        });
        // Redirect to question manager for the newly created quiz
        navigate(`/admin/quizzes/${created.id}/questions`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save quiz';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz data..." fullPage />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/admin/quizzes"
        className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        <span>Back to Admin Studio</span>
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isEditMode ? 'Edit Quiz' : 'New Quiz'}</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {isEditMode ? 'Update Quiz Details' : 'Create a New Quiz'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          {isEditMode
            ? 'Modify the title or description of this quiz.'
            : 'Fill in the information below to set up a new quiz topic.'}
        </p>
      </div>

      {/* Error Banners */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Operation failed</p>
            <p className="text-xs text-rose-400/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-200">
              Quiz Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. World History, Sports Trivia, Advanced React"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {validationError && (
              <p className="text-xs text-rose-400 mt-1">{validationError}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-200">
              Description <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide context, instructions, or topics covered in this quiz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
            <Link to="/admin/quizzes">
              <Button variant="outline" size="md" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
            >
              {isEditMode ? 'Save Changes' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};


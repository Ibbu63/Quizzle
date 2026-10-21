import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, Layers } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8" />
      </div>

      <span className="font-mono text-sm text-indigo-400 font-bold uppercase tracking-wider mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
        The page or quiz you requested does not exist or may have been relocated.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/quizzes">
          <Button variant="outline" icon={<Layers className="w-4 h-4" />}>
            Explore Quizzes
          </Button>
        </Link>
      </div>
    </div>
  );
};


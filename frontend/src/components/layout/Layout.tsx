import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Activity, Server } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-300">Quizzle</span>
            <span>•</span>

            <span>Level Up Yourself</span>
            <span>Connected to Spring Boot REST Backend</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-zinc-400">
              <Server className="w-3.5 h-3.5 text-indigo-400" />

              <span>connected</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Active</span>

              <span>Server</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>API Active</span>

            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


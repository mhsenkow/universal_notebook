import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ 
  children: React.ReactNode;
  notebookName?: string;
}> = ({ children, notebookName = 'Notebook' }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-8 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {notebookName}
          </h1>
        </header>

        <main className="flex-1 overflow-auto max-w-[1200px] mx-auto w-full">
          {children}
        </main>

        <footer className="h-16 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center px-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with Next.js and TailwindCSS
          </p>
        </footer>
      </div>
    </div>
  );
}; 
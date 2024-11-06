import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { useRouter } from 'next/router';
import { Notebook } from '../../types/Notebook';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const loadedNotebooks = StorageService.getAllNotebooks();
    setNotebooks(loadedNotebooks);

    const handleStorageChange = () => {
      const updatedNotebooks = StorageService.getAllNotebooks();
      setNotebooks(updatedNotebooks);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCreateNotebook = () => {
    const notebook = StorageService.createNotebook();
    setNotebooks(prev => [...prev, notebook]);
    router.push(`/notebook/${notebook.id}`);
  };

  const handleDeleteNotebook = (e: React.MouseEvent, notebookId: string) => {
    e.stopPropagation();
    StorageService.deleteNotebook(notebookId);
    setNotebooks(prev => prev.filter(n => n.id !== notebookId));
  };

  const startEditing = (e: React.MouseEvent, notebook: Notebook) => {
    e.stopPropagation();
    setEditingId(notebook.id);
    setEditingName(notebook.name);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editingName.trim()) {
      StorageService.renameNotebook(editingId, editingName.trim());
      setNotebooks(prev => prev.map(n => 
        n.id === editingId 
          ? { ...n, name: editingName.trim() }
          : n
      ));
      setEditingId(null);
    }
  };

  return (
    <div className="w-72 flex-shrink-0 h-screen sticky top-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notebook</h1>
        <div className="mt-4">
          <button
            onClick={handleCreateNotebook}
            className="w-full btn-primary"
          >
            New Notebook
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-2">
          {notebooks.map(notebook => (
            <div 
              key={notebook.id}
              className="group flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
              onClick={() => router.push(`/notebook/${notebook.id}`)}
            >
              {editingId === notebook.id ? (
                <form 
                  onSubmit={handleRename}
                  className="flex-1 mr-2"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-gray-900 border rounded-md"
                    autoFocus
                    onBlur={() => setEditingId(null)}
                  />
                </form>
              ) : (
                <span 
                  className="truncate text-gray-700 dark:text-gray-300"
                  onDoubleClick={(e) => startEditing(e, notebook)}
                >
                  {notebook.name}
                </span>
              )}
              <button
                onClick={(e) => handleDeleteNotebook(e, notebook.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded transition-opacity duration-200"
                title="Delete notebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
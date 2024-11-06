import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout/Layout';
import { Notebook } from '../../components/notebook/Notebook';
import { StorageService } from '../../services/storage';
import type { Notebook as NotebookType } from '../../types/Notebook';

export default function NotebookPage() {
  const router = useRouter();
  const { id } = router.query;
  const [notebook, setNotebook] = useState<NotebookType | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      const notebooks = StorageService.getAllNotebooks();
      const found = notebooks.find(n => n.id === id);
      if (!found) {
        router.push('/');
        return;
      }
      setNotebook(found);
    }
  }, [id, router]);

  if (!notebook) return null;

  return (
    <Layout notebookName={notebook.name}>
      <Notebook notebookId={notebook.id} />
    </Layout>
  );
}
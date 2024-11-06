import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Notebook } from '../components/notebook/Notebook';

export default function Home() {
  return (
    <Layout notebookName="New Notebook">
      <Notebook notebookId={undefined} />
    </Layout>
  );
} 
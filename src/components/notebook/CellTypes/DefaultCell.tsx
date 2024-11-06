import React from 'react';
import { Cell } from '../../../types/Cell';

export const DefaultCell: React.FC<{ cell: Cell }> = ({ cell }) => (
  <div className="p-4 bg-gray-100">
    <pre>{cell.content}</pre>
  </div>
); 
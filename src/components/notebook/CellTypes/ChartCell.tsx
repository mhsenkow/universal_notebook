import React from 'react';
import { Cell } from '../../../types/Cell';

export const ChartCell: React.FC<{ cell: Cell }> = ({ cell }) => (
  <div className="p-4">
    <div>Chart Placeholder: {cell.content}</div>
  </div>
); 
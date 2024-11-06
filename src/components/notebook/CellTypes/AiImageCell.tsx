import React from 'react';
import { Cell } from '../../../types/Cell';

export const AiImageCell: React.FC<{ cell: Cell }> = ({ cell }) => (
  <div className="p-4">
    <div>AI Image Placeholder: {cell.content}</div>
  </div>
); 
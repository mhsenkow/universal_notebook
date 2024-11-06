import { TextCell } from './TextCell';
import { DataCell } from './DataCell';
import { ChartCell } from './ChartCell';
import { AiImageCell } from './AiImageCell';
import { DefaultCell } from './DefaultCell';
import { Cell } from '../../../types/Cell';

export const getCellComponent = (type: Cell['type']) => {
  switch (type) {
    case 'data':
      return DataCell;
    case 'text':
      return TextCell;
    case 'chart':
      return ChartCell;
    case 'aiImage':
      return AiImageCell;
    default:
      return DefaultCell;
  }
}; 
import { useState, useCallback } from 'react';
import { Cell } from '../types/Cell';

export const useCellConnection = () => {
  const [connections, setConnections] = useState<Array<{from: string, to: string}>>([]);

  const connectCells = useCallback((fromId: string, toId: string) => {
    setConnections(prev => [...prev, { from: fromId, to: toId }]);
  }, []);

  const getInputs = useCallback((cellId: string) => {
    return connections
      .filter(conn => conn.to === cellId)
      .map(conn => conn.from);
  }, [connections]);

  return { connections, connectCells, getInputs };
}; 
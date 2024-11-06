import { useState, useCallback } from 'react';
import { Cell } from '../types/Cell';

export const useConnectionManager = () => {
  const [draggingConnection, setDraggingConnection] = useState<{
    sourceCell: string;
    sourcePort: string;
  } | null>(null);

  const startConnection = useCallback((cellId: string, portId: string) => {
    setDraggingConnection({ sourceCell: cellId, sourcePort: portId });
  }, []);

  const completeConnection = useCallback((targetCell: string, targetPort: string) => {
    if (!draggingConnection) return null;

    const connection = {
      source: {
        cellId: draggingConnection.sourceCell,
        portId: draggingConnection.sourcePort
      },
      target: {
        cellId: targetCell,
        portId: targetPort
      }
    };

    setDraggingConnection(null);
    return connection;
  }, [draggingConnection]);

  return {
    draggingConnection,
    startConnection,
    completeConnection
  };
}; 
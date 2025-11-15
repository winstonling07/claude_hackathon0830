import { useState, useEffect, useCallback } from 'react';
import { db, SyncOperation } from '../lib/db';
import { useOnlineStatus } from './useOnlineStatus';

export function useSyncQueue() {
  const [pendingOps, setPendingOps] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  // Count pending operations
  const updatePendingCount = useCallback(async () => {
    const count = await db.syncQueue.where('synced').equals(0).count();
    setPendingOps(count);
  }, []);

  // Queue an operation for sync
  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    entity: 'note' | 'flashcard' | 'folder',
    entityId: string,
    data: any
  ) => {
    await db.syncQueue.add({
      type,
      entity,
      entityId,
      data,
      timestamp: Date.now(),
      synced: 0, // 0 = not synced
    });
    await updatePendingCount();
  }, [updatePendingCount]);

  // Flush queue when online
  const flushQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const operations = await db.syncQueue
        .where('synced')
        .equals(0)
        .toArray();

      for (const op of operations) {
        try {
          // In a real app, this would call Supabase
          // For demo, we'll just mark as synced
          console.log('Syncing operation:', op);

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));

          // Mark as synced
          await db.syncQueue.update(op.id!, { synced: 1 }); // 1 = synced

          // Update entity sync status
          if (op.entity === 'note') {
            await db.notes.update(op.entityId, { syncStatus: 'synced' });
          } else if (op.entity === 'flashcard') {
            await db.flashcards.update(op.entityId, { syncStatus: 'synced' });
          }
        } catch (error) {
          console.error('Sync error for operation:', op, error);
          await db.syncQueue.update(op.id!, {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      await updatePendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  // Auto-flush when coming online
  useEffect(() => {
    if (isOnline && pendingOps > 0) {
      flushQueue();
    }
  }, [isOnline, pendingOps, flushQueue]);

  // Initial count
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    queueOperation,
    flushQueue,
    pendingOps,
    isSyncing,
  };
}

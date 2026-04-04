'use client';

import { useOptimistic, useTransition } from 'react';
import { 
  restartSession, 
  releaseSession, 
  claimSession 
} from '@/lib/session-actions';

interface Worker {
  id: string;
  containerName: string;
  dockerStatus: string;
  currentOwnerId: string | null;
  desktopSession?: {
    id: string;
  } | null;
}

interface WorkerCardProps {
  worker: Worker;
  userId: string;
}

export function WorkerCard({ worker, userId }: WorkerCardProps) {
  const [isPending, startTransition] = useTransition();
  const isOwnedByMe = worker.currentOwnerId === userId;
  const isClaimed = !!worker.currentOwnerId;
  const sessionId = worker.desktopSession?.id;

  // Optimistic UI for status and ownership
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    { status: worker.dockerStatus, ownerId: worker.currentOwnerId },
    (state, newState: { status?: string, ownerId?: string | null }) => ({
      ...state,
      ...newState
    })
  );

  const handleClaim = async () => {
    startTransition(async () => {
      setOptimisticStatus({ ownerId: userId });
      try {
        await claimSession(worker.id);
      } catch (error) {
        console.error('Failed to claim:', error);
      }
    });
  };

  const handleRestart = async () => {
    startTransition(async () => {
      setOptimisticStatus({ status: 'restarting' });
      try {
        await restartSession(worker.id);
      } catch (error) {
        console.error('Failed to restart:', error);
      }
    });
  };

  const handleRelease = async () => {
    startTransition(async () => {
      setOptimisticStatus({ ownerId: null });
      try {
        await releaseSession(sessionId!);
      } catch (error) {
        console.error('Failed to release:', error);
      }
    });
  };

  const currentStatus = optimisticStatus.status;
  const currentOwnerId = optimisticStatus.ownerId;
  const currentIsOwnedByMe = currentOwnerId === userId;
  const currentIsClaimed = !!currentOwnerId;

  return (
    <div 
      className={`border rounded-xl p-6 transition-all shadow-sm ${
        currentIsOwnedByMe 
          ? 'border-green-500 bg-green-50/30' 
          : currentIsClaimed 
            ? 'border-gray-200 bg-gray-50 opacity-75' 
            : 'border-blue-200 hover:border-blue-400 bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{worker.containerName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${
              currentStatus === 'running' ? 'bg-green-500' : 
              currentStatus === 'restarting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`}></span>
            <span className="text-xs font-semibold uppercase text-gray-500">
              {currentStatus}
            </span>
          </div>
        </div>
        {currentIsOwnedByMe && (
          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Your Session
          </span>
        )}
      </div>

      <div className="space-y-4">
        {currentIsOwnedByMe ? (
          <div className="flex flex-col gap-2">
            <a 
              href={`/desktop/${sessionId}/?path=desktop/${sessionId}/websockify`}
              className="w-full text-center bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Open Desktop
            </a>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleRestart}
                disabled={isPending}
                className="w-full bg-white text-gray-700 border border-gray-200 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                {currentStatus === 'restarting' ? 'Restarting...' : 'Restart'}
              </button>
              <button 
                onClick={handleRelease}
                disabled={isPending}
                className="w-full bg-white text-red-600 border border-red-100 py-2 rounded-lg text-sm font-bold hover:bg-red-50 disabled:opacity-50"
              >
                {isPending && currentOwnerId === null ? 'Releasing...' : 'Release'}
              </button>
            </div>
          </div>
        ) : currentIsClaimed ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 font-medium italic">Occupied by another user</p>
          </div>
        ) : (
          <button 
            onClick={handleClaim}
            disabled={isPending}
            className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2.5 rounded-lg font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isPending && currentOwnerId === userId ? 'Claiming...' : 'Claim Runtime'}
          </button>
        )}
      </div>
    </div>
  );
}

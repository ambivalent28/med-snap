import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface Props {
  uploadCount: number;
  uploadLimit: number;
  subscriptionStatus?: 'active' | 'inactive' | 'trialing' | null;
}

const UsageIndicator: React.FC<Props> = ({ uploadCount, uploadLimit, subscriptionStatus }) => {
  const isFree = !subscriptionStatus || subscriptionStatus === 'inactive';
  const remaining = Math.max(0, uploadLimit - uploadCount);
  const percentage = (uploadCount / uploadLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = uploadCount >= uploadLimit;

  return (
    <div className="rounded-lg bg-slate-800 border border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">Upload Usage</p>
          <p className="mt-1 text-xs text-slate-400">
            {isFree ? 'Free tier' : 'Pro subscription'}
          </p>
        </div>
        {isAtLimit ? (
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        ) : (
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-300">
            {uploadCount} / {uploadLimit} {uploadLimit === Infinity ? '' : 'uploads'}
          </span>
          {isFree && (
            <span className={isNearLimit ? 'text-red-400' : 'text-slate-400'}>
              {remaining} remaining
            </span>
          )}
        </div>
        {uploadLimit !== Infinity && (
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full transition-all ${
                isAtLimit
                  ? 'bg-red-500'
                  : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-brand-600'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        )}
        {isAtLimit && isFree && (
          <p className="mt-2 text-xs text-red-400">
            You've reached your free limit. Upgrade to Pro for unlimited uploads.
          </p>
        )}
      </div>
    </div>
  );
};

export default UsageIndicator;


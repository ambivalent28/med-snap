import { ArrowRightIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface Props {
  onUpgrade: () => void;
}

const LimitReachedBanner: React.FC<Props> = ({ onUpgrade }) => {
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-100">
            You've used all 10 free uploads
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Upgrade for unlimited uploads. $25/year.
          </p>
        </div>
        
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition"
        >
          Upgrade
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LimitReachedBanner;

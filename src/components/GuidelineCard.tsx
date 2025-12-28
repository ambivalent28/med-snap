import {
  DocumentIcon,
  PhotoIcon,
  TagIcon,
  CalendarDaysIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import React from 'react';
import type { Guideline } from '../types';

interface Props {
  guideline: Guideline;
  onOpen: (guideline: Guideline) => void;
  onDelete?: (guideline: Guideline) => void;
}

const GuidelineCard: React.FC<Props> = ({ guideline, onOpen, onDelete }) => {
  const isPdf = guideline.file_type === 'pdf';
  const isWord = guideline.file_type === 'word';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Are you sure you want to delete "${guideline.title}"?`)) {
      onDelete(guideline);
    }
  };

  return (
    <div
      className="group relative flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg cursor-pointer"
      role="button"
      onClick={() => onOpen(guideline)}
    >
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute right-2 top-2 rounded-full bg-red-900/50 border border-red-700 p-1.5 text-red-400 opacity-0 transition hover:bg-red-900/70 group-hover:opacity-100"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPdf || isWord ? (
            <DocumentIcon className="h-6 w-6 text-brand-500" />
          ) : (
            <PhotoIcon className="h-6 w-6 text-brand-500" />
          )}
          <div className="truncate text-sm font-semibold text-slate-100" title={guideline.title}>
            {guideline.title}
          </div>
        </div>
        <span className="rounded-full bg-brand-900/50 border border-brand-700 px-2 py-1 text-[11px] font-medium text-brand-300">
          {guideline.file_type.toUpperCase()}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-400">
        {guideline.notes || 'No notes'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>{format(new Date(guideline.created_at), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <TagIcon className="h-4 w-4" />
          <div className="flex flex-wrap gap-1">
            {guideline.tags.length ? (
              guideline.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-300"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-slate-500">No tags</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelineCard;


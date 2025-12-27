import {
  DocumentIcon,
  PhotoIcon,
  TagIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import React from 'react';
import type { Guideline } from '../types';

interface Props {
  guideline: Guideline;
  onOpen: (guideline: Guideline) => void;
}

const GuidelineCard: React.FC<Props> = ({ guideline, onOpen }) => {
  const isPdf = guideline.file_type === 'pdf';
  return (
    <div
      className="group flex h-full flex-col rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:border-brand-200 hover:ring-brand-100"
      role="button"
      onClick={() => onOpen(guideline)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPdf ? (
            <DocumentIcon className="h-6 w-6 text-brand-600" />
          ) : (
            <PhotoIcon className="h-6 w-6 text-brand-600" />
          )}
          <div className="truncate text-sm font-semibold text-slate-900" title={guideline.title}>
            {guideline.title}
          </div>
        </div>
        <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700">
          {guideline.file_type.toUpperCase()}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {guideline.notes || 'No notes'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-slate-400">No tags</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelineCard;


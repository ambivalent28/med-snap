import { TrashIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import React from 'react';
import type { Guideline } from '../types';
import ThumbnailPreview from './ThumbnailPreview';

interface Props {
  guideline: Guideline;
  onOpen: (guideline: Guideline) => void;
  onDelete?: (guideline: Guideline) => void;
  draggable?: boolean;
}

const GuidelineCard: React.FC<Props> = ({ guideline, onOpen, onDelete, draggable = true }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Delete "${guideline.title}"?`)) {
      onDelete(guideline);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('guidelineId', guideline.id);
    e.dataTransfer.setData('guidelineTitle', guideline.title);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="group relative flex h-full flex-col rounded-xl border border-slate-700 bg-slate-800 p-3 transition-all duration-200 hover:border-brand-600/50 hover:shadow-lg hover:shadow-brand-900/10 cursor-pointer"
      role="button"
      onClick={() => onOpen(guideline)}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute right-2 top-2 z-10 rounded-full bg-red-900/90 border border-red-700 p-1.5 text-red-400 opacity-0 transition hover:bg-red-800 group-hover:opacity-100"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
      
      <div className="mb-3">
        <ThumbnailPreview 
          filePath={guideline.file_path} 
          fileType={guideline.file_type} 
          title={guideline.title} 
        />
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-200 truncate" title={guideline.title}>
          {guideline.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11px] text-slate-500">
            {guideline.category || 'General'} • {guideline.file_type.toUpperCase()}
          </p>
          {guideline.notes && (
            <ChatBubbleBottomCenterTextIcon 
              className="h-3 w-3 text-slate-500" 
              title="Has notes"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidelineCard;

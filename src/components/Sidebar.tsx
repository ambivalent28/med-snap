import { ChevronDownIcon, ChevronRightIcon, FolderArrowDownIcon } from '@heroicons/react/24/solid';
import React, { useState, useMemo } from 'react';
import type { Guideline } from '../types';

interface Props {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  guidelines: Guideline[];
  onUpdateGuidelineCategory?: (guidelineId: string, newCategory: string) => void;
}

const Sidebar: React.FC<Props> = ({ categories, selected, onSelect, guidelines, onUpdateGuidelineCategory }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  // Group guidelines by category
  const guidelinesByCategory = useMemo(() => {
    const grouped: Record<string, Guideline[]> = {};
    
    // Initialize all categories
    categories.forEach(cat => {
      grouped[cat] = [];
    });
    
    // Group guidelines
    guidelines.forEach(g => {
      const cat = g.category && g.category.trim() !== '' ? g.category : 'General';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(g);
    });
    
    return grouped;
  }, [guidelines, categories]);

  // Get categories sorted alphabetically
  const displayCategories = useMemo(() => {
    const cats = [...categories];
    cats.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return cats;
  }, [categories]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleCategoryClick = (category: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category);
  };

  const handleDragStart = (e: React.DragEvent, guideline: Guideline) => {
    e.dataTransfer.setData('guidelineId', guideline.id);
    e.dataTransfer.setData('guidelineTitle', guideline.title);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOverCategory(category);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverCategory(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    setDragOverCategory(null);
    const guidelineId = e.dataTransfer.getData('guidelineId');
    if (guidelineId && onUpdateGuidelineCategory) {
      onUpdateGuidelineCategory(guidelineId, targetCategory);
    }
  };

  const getCategoryClasses = (cat: string) => {
    const isSelected = selected === cat;
    const isDragOver = dragOverCategory === cat;
    
    if (isDragOver) {
      return 'bg-emerald-900/50 text-emerald-300 border-2 border-dashed border-emerald-500 scale-[1.02]';
    }
    if (isSelected) {
      return 'bg-brand-900/50 text-brand-300 border border-brand-700';
    }
    return 'text-slate-300 hover:bg-slate-700 border border-transparent';
  };

  return (
    <aside className="w-60 space-y-2 rounded-2xl bg-slate-800 border border-slate-700 p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Categories
      </div>
      
      {/* All button */}
      <button
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          selected === null
            ? 'bg-brand-900/50 text-brand-300 border border-brand-700'
            : 'text-slate-300 hover:bg-slate-700'
        }`}
        onClick={(e) => handleCategoryClick(null, e)}
      >
        All
        <span className="ml-2 text-xs text-slate-500">({guidelines.length})</span>
      </button>

      {/* Category list */}
      {displayCategories.map((cat) => {
        const isExpanded = expandedCategories.has(cat);
        const categoryGuidelines = guidelinesByCategory[cat] || [];
        const count = categoryGuidelines.length;
        const isDragOver = dragOverCategory === cat;

        return (
          <div key={cat} className="space-y-1">
            <div
              className={`flex items-center w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-150 cursor-pointer ${getCategoryClasses(cat)}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, cat)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cat)}
            >
              <button
                className="mr-2 p-0.5 hover:bg-slate-600 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(cat);
                }}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>
              <span 
                className="flex-1"
                onClick={(e) => handleCategoryClick(cat, e)}
              >
                {cat}
              </span>
              {isDragOver ? (
                <FolderArrowDownIcon className="h-4 w-4 text-emerald-400 animate-bounce" />
              ) : (
                <span className="text-xs text-slate-500">({count})</span>
              )}
            </div>

            {/* Expanded guideline list */}
            {isExpanded && categoryGuidelines.length > 0 && (
              <div className="ml-6 space-y-1 border-l border-slate-700 pl-2">
                {categoryGuidelines.map((g) => (
                  <div
                    key={g.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, g)}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200 cursor-grab active:cursor-grabbing transition group"
                    title={`Drag "${g.title}" to another category`}
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-brand-500 transition" />
                    <span className="truncate">{g.title}</span>
                  </div>
                ))}
              </div>
            )}
            {isExpanded && categoryGuidelines.length === 0 && (
              <div className="ml-6 px-2 py-1.5 text-xs text-slate-500 italic border-l border-slate-700 pl-2">
                No guidelines
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;

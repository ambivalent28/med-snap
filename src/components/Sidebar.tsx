import React from 'react';

interface Props {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const Sidebar: React.FC<Props> = ({ categories, selected, onSelect }) => {
  return (
    <aside className="w-60 space-y-2 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-100 glass-panel">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Categories
      </div>
      <button
        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
          selected === null
            ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
            : 'text-slate-700 hover:bg-slate-50'
        }`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
            selected === cat
              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;


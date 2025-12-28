import React from 'react';

interface Props {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const Sidebar: React.FC<Props> = ({ categories, selected, onSelect }) => {
  return (
    <aside className="w-60 space-y-2 rounded-2xl bg-slate-800 border border-slate-700 p-4 shadow-sm glass-panel">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Categories
      </div>
      <button
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          selected === null
            ? 'bg-brand-900/50 text-brand-300 border border-brand-700'
            : 'text-slate-300 hover:bg-slate-700'
        }`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
            selected === cat
              ? 'bg-brand-900/50 text-brand-300 border border-brand-700'
              : 'text-slate-300 hover:bg-slate-700'
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


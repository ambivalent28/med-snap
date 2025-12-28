import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or notes"
        className="w-full rounded-lg border border-slate-600 bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 placeholder:text-slate-500"
      />
    </div>
  );
};

export default SearchBar;

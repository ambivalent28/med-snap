import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<Props> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search title, tags, notes'}
        className={classNames(
          'w-full rounded-lg border border-slate-600 bg-slate-700 pl-10 pr-3 py-2 text-sm text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          'placeholder:text-slate-500'
        )}
      />
    </div>
  );
};

export default SearchBar;


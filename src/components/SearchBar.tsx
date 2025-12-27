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
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search title, tags, notes'}
        className={classNames(
          'w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          'placeholder:text-slate-400'
        )}
      />
    </div>
  );
};

export default SearchBar;

